/// <reference types="cypress" />

/**
 * 2. Gerenciamento de Clientes — testes de INTERFACE (tela /admin/clientes)
 */
interface Cliente {
  id_cliente: number;
  nome: string;
  cpf: string;
  email: string;
  ativo?: boolean;
}

describe('2. Gerenciamento de Clientes (interface)', () => {
  let clientes: Cliente[];

  beforeEach(() => {
    cy.bloquearApiNaoMockada();
    cy.intercept('GET', '**/api/produtos*', { fixture: 'produtos.json' }).as('produtos');
    cy.fixture('clientes.json').then((lista: Cliente[]) => {
      clientes = [...lista];
      // a listagem sempre devolve o estado atual (muda depois de criar/editar/excluir)
      cy.intercept('GET', '**/api/clientes', (req) => req.reply(clientes)).as('listarClientes');
    });
  });

  const modal = (titulo: string) => cy.get(`[role="dialog"][aria-label="${titulo}"]`);

  // -------------------------------------------------------------------------
  describe('Cadastro de Cliente pelo Vendedor/Gerente', () => {
    it('CORRETO: Vendedor cadastra novo cliente', () => {
      const novo = { nome: 'Helena Nova', cpf: '32165498700', email: 'helena@teste.com', senha: 'senha123' };
      cy.intercept('POST', '**/api/registrar', (req) => {
        clientes.push({ id_cliente: 30, nome: novo.nome, cpf: novo.cpf, email: novo.email, ativo: true });
        req.reply({ statusCode: 201, body: { mensagem: 'Usuário registrado com sucesso!' } });
      }).as('criarCliente');

      cy.visitComo('vendedor', '/admin/clientes');
      cy.wait('@listarClientes');
      cy.contains('button', 'Novo cliente').click();

      modal('Novo cliente').within(() => {
        cy.campo('Nome').type(novo.nome);
        cy.campo('CPF').type(novo.cpf);
        cy.campo('E-mail').type(novo.email);
        cy.campo('Senha').type(novo.senha);
        cy.contains('button', 'Salvar').click();
      });

      cy.wait('@criarCliente').its('request.body').should('deep.equal', novo);
      cy.contains('Cliente registrado.').should('be.visible');
      modal('Novo cliente').should('not.exist');
      cy.contains('tr', novo.nome).should('contain.text', novo.cpf).and('contain.text', novo.email);
    });

    it('INCORRETO: Cliente tenta cadastrar outro cliente', () => {
      cy.intercept('POST', '**/api/registrar').as('criarCliente');

      cy.visitComo('cliente', '/admin/clientes');

      // a área administrativa é negada e o cliente volta para a vitrine
      cy.location('pathname').should('eq', '/produtos');
      cy.contains('button', 'Novo cliente').should('not.exist');
      cy.get('nav[aria-label="Principal"]').should('not.contain.text', 'Gerência').and('not.contain.text', 'Balcão');
      cy.get('@listarClientes.all').should('have.length', 0);
      cy.get('@criarCliente.all').should('have.length', 0);
    });
  });

  // -------------------------------------------------------------------------
  describe('Atualização de Cliente', () => {
    it('CORRETO: Atualização de dados válidos (e-mail)', () => {
      const novoEmail = 'jose.bezerra@novoemail.com';
      cy.intercept('PUT', '**/api/clientes/6', (req) => {
        clientes = clientes.map((c) => (c.id_cliente === 6 ? { ...c, email: req.body.email } : c));
        req.reply({ statusCode: 200, body: { id_cliente: 6, email: req.body.email, mensagem: 'Cliente e usuário atualizados com sucesso!' } });
      }).as('atualizar');

      cy.visitComo('vendedor', '/admin/clientes');
      cy.wait('@listarClientes');
      cy.get('[aria-label="Editar José Bezerra"]').click();

      modal('Editar cliente').within(() => {
        cy.campo('E-mail').should('have.value', 'Bezerra@gmail.com').clear().type(novoEmail);
        cy.contains('button', 'Salvar').click();
      });

      cy.wait('@atualizar').its('request.body.email').should('eq', novoEmail);
      cy.contains('Cliente atualizado.').should('be.visible');
      cy.contains('tr', 'José Bezerra').should('contain.text', novoEmail);
    });

    it('INCORRETO: Atualização de cliente inexistente', () => {
      // o cliente foi removido por outra pessoa enquanto a tela estava aberta
      cy.intercept('PUT', '**/api/clientes/6', { statusCode: 404, body: { erro: 'Cliente não encontrado' } }).as('atualizar');

      cy.visitComo('vendedor', '/admin/clientes');
      cy.wait('@listarClientes');
      cy.get('[aria-label="Editar José Bezerra"]').click();
      modal('Editar cliente').within(() => {
        cy.campo('E-mail').clear().type('qualquer@teste.com');
        cy.contains('button', 'Salvar').click();
      });

      cy.wait('@atualizar').its('response.statusCode').should('eq', 404);
      cy.contains('Cliente não encontrado').should('be.visible');
      modal('Editar cliente').should('exist'); // nada foi salvo
      cy.contains('tr', 'José Bezerra').should('contain.text', 'Bezerra@gmail.com');
    });
  });

  // -------------------------------------------------------------------------
  describe('Exclusão de Cliente', () => {
    it('CORRETO: Gerente exclui cliente sem vendas vinculadas', () => {
      cy.intercept('DELETE', '**/api/clientes/6', (req) => {
        clientes = clientes.filter((c) => c.id_cliente !== 6);
        req.reply({ statusCode: 200, body: { mensagem: 'Cliente 6 e seu usuário deletados!' } });
      }).as('excluir');

      cy.visitComo('gerente', '/admin/clientes');
      cy.wait('@listarClientes');
      cy.get('[aria-label="Excluir José Bezerra"]').click();
      modal('Excluir cliente').within(() => cy.contains('button', 'Excluir').click());

      cy.wait('@excluir').its('response.statusCode').should('eq', 200);
      cy.contains('Cliente excluído.').should('be.visible');
      cy.contains('tr', 'José Bezerra').should('not.exist');
      cy.contains('tr', 'Ana Clara').should('exist');
    });

    it('INCORRETO: Vendedor tenta excluir cliente', () => {
      cy.intercept('DELETE', '**/api/clientes/*').as('excluir');

      cy.visitComo('vendedor', '/admin/clientes');
      cy.wait('@listarClientes');

      cy.contains('tr', 'José Bezerra').within(() => {
        cy.get('[aria-label="Editar José Bezerra"]').should('exist');
        cy.get('[aria-label="Excluir José Bezerra"]').should('not.exist');
      });
      cy.get('[aria-label^="Excluir"]').should('not.exist');
      cy.get('@excluir.all').should('have.length', 0);
    });
  });
});
