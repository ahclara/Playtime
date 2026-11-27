/// <reference types="cypress" />
import { brl } from '../../support/dados';

/**
 * 3. Gerenciamento de Produtos — testes de INTERFACE (/produtos e /admin/produtos)
 */
interface Produto {
  id_produto: number;
  nome: string;
  descricao?: string;
  preco_unitario: number;
  estoque: number;
  categoria?: string;
}

describe('3. Gerenciamento de Produtos (interface)', () => {
  let produtos: Produto[];

  beforeEach(() => {
    cy.bloquearApiNaoMockada();
    cy.fixture('produtos.json').then((lista: Produto[]) => {
      produtos = [...lista];
      cy.intercept('GET', '**/api/produtos*', (req) => req.reply(produtos)).as('produtos');
    });
  });

  const modal = (titulo: string) => cy.get(`[role="dialog"][aria-label="${titulo}"]`);

  // -------------------------------------------------------------------------
  describe('Consulta de Produtos', () => {
    it('CORRETO: Listagem de produtos disponíveis', () => {
      cy.visitComo('cliente', '/produtos');
      cy.wait('@produtos');

      cy.get('article.toy-card').should('have.length', produtos.length);
      produtos.forEach((p) => {
        cy.contains('article', p.nome).within(() => {
          cy.contains(brl(p.preco_unitario)).should('exist'); // preço
          cy.contains(p.estoque > 0 ? `${p.estoque} em estoque` : 'Sem estoque').should('exist'); // estoque
          cy.contains(p.categoria || 'Sem categoria').should('exist'); // categoria
        });
      });
      // produto sem estoque não pode ser comprado
      cy.contains('article', 'catnap2.0').find('button').contains('Esgotado').should('be.disabled');
    });

    it('INCORRETO: Consulta de produto com ID inexistente', () => {
      // abrir o produto 99999 pela URL de edição não encontra nada e não abre o formulário
      cy.visitComo('gerente', '/admin/produtos?editar=99999');
      cy.wait('@produtos');
      cy.get('table').should('be.visible');
      cy.get('[role="dialog"]').should('not.exist');

      // a busca por um produto que não existe mostra "nenhum encontrado"
      cy.intercept('GET', '**/api/produtos?filtro=*', []).as('busca');
      cy.visitComo('cliente', '/produtos');
      cy.get('input[aria-label="Buscar produto"]').type('Produto que não existe');
      cy.wait('@busca');
      cy.contains('Nenhum brinquedo encontrado para "Produto que não existe".').should('be.visible');
    });
  });

  // -------------------------------------------------------------------------
  describe('Cadastro de Produto', () => {
    const novo = { nome: 'Boxy Boo', preco_unitario: 29.9, estoque: 20, categoria: 'Pelúcia', descricao: 'Pelúcia do Boxy Boo' };

    const preencherProduto = (dados: typeof novo) => {
      modal('Novo produto').within(() => {
        cy.campo('Nome').type(dados.nome);
        cy.campo('Preço').definirValor(dados.preco_unitario);
        cy.campo('Estoque').definirValor(dados.estoque);
        cy.campo('Categoria').type(dados.categoria);
        cy.campo('Descrição').type(dados.descricao);
        cy.contains('button', 'Salvar').click();
      });
    };

    it('CORRETO: Gerente cadastra produto com dados válidos', () => {
      cy.intercept('POST', '**/api/produtos', (req) => {
        const criado = { id_produto: 16, ...req.body };
        produtos.push(criado);
        req.reply({ statusCode: 201, body: criado });
      }).as('criar');

      cy.visitComo('gerente', '/admin/produtos');
      cy.wait('@produtos');
      cy.contains('button', 'Novo produto').click();
      preencherProduto(novo);

      cy.wait('@criar').its('request.body').should('deep.equal', novo);
      cy.contains('Produto criado.').should('be.visible');
      cy.contains('tr', novo.nome).should('contain.text', novo.categoria).and('contain.text', `${novo.estoque} un`);
      cy.contains('tr', novo.nome).contains(brl(novo.preco_unitario)).should('exist');
    });

    it('INCORRETO: Cadastro com preço negativo', () => {
      cy.intercept('POST', '**/api/produtos').as('criar');

      cy.visitComo('gerente', '/admin/produtos');
      cy.wait('@produtos');
      cy.contains('button', 'Novo produto').click();
      preencherProduto({ ...novo, preco_unitario: -10 });

      cy.contains('Preencha nome e preço corretamente.').should('be.visible');
      modal('Novo produto').should('exist');
      cy.get('@criar.all').should('have.length', 0);
      cy.contains('tr', novo.nome).should('not.exist');
    });
  });

  // -------------------------------------------------------------------------
  describe('Atualização de Produto', () => {
    it('CORRETO: Atualização de preço de produto', () => {
      const novoPreco = 39.9;
      cy.intercept('PUT', '**/api/produtos/1', (req) => {
        produtos = produtos.map((p) => (p.id_produto === 1 ? { ...p, ...req.body } : p));
        req.reply({ statusCode: 200, body: { mensagem: 'Produto atualizado com sucesso!' } });
      }).as('atualizar');

      cy.visitComo('gerente', '/admin/produtos');
      cy.wait('@produtos');
      cy.get('[aria-label="Editar Kissy Missy"]').click();
      modal('Editar produto').within(() => {
        cy.campo('Preço').definirValor(novoPreco);
        cy.contains('button', 'Salvar').click();
      });

      cy.wait('@atualizar').its('request.body.preco_unitario').should('eq', novoPreco);
      cy.contains('Produto atualizado.').should('be.visible');
      cy.contains('tr', 'Kissy Missy').contains(brl(novoPreco)).should('exist');
    });

    it('INCORRETO: Vendedor tenta editar produto', () => {
      cy.intercept('PUT', '**/api/produtos/*').as('atualizar');

      // a tela de gestão de produtos é exclusiva do gerente
      cy.visitComo('vendedor', '/admin/produtos');
      cy.location('pathname').should('eq', '/admin/clientes');
      cy.get('nav[aria-label="Balcão"]').should('not.contain.text', 'Produtos');

      // e na vitrine o vendedor não vê o botão de editar
      cy.visitComo('vendedor', '/produtos');
      cy.wait('@produtos');
      cy.get('[aria-label="Editar produto"]').should('not.exist');
      cy.get('@atualizar.all').should('have.length', 0);
    });
  });

  // -------------------------------------------------------------------------
  describe('Exclusão de Produto', () => {
    it('CORRETO: Exclusão de produto sem vendas vinculadas', () => {
      cy.intercept('DELETE', '**/api/produtos/15', (req) => {
        produtos = produtos.filter((p) => p.id_produto !== 15);
        req.reply({ statusCode: 200, body: { mensagem: 'Produto deletado com sucesso!' } });
      }).as('excluir');

      cy.visitComo('gerente', '/admin/produtos');
      cy.wait('@produtos');
      cy.get('[aria-label="Excluir catnap2.0"]').click();
      modal('Excluir produto').within(() => cy.contains('button', 'Excluir').click());

      cy.wait('@excluir').its('response.statusCode').should('eq', 200);
      cy.contains('Produto excluído.').should('be.visible');
      cy.contains('tr', 'catnap2.0').should('not.exist');
    });

    it('INCORRETO: Exclusão de produto vinculado a vendas', () => {
      cy.intercept('DELETE', '**/api/produtos/1', {
        statusCode: 400,
        body: { erro: 'Produto possui vendas vinculadas e não pode ser excluído' },
      }).as('excluir');

      cy.visitComo('gerente', '/admin/produtos');
      cy.wait('@produtos');
      cy.get('[aria-label="Excluir Kissy Missy"]').click();
      modal('Excluir produto').within(() => cy.contains('button', 'Excluir').click());

      cy.wait('@excluir');
      cy.contains(/possui vendas vinculadas/i).should('be.visible');
      cy.contains('tr', 'Kissy Missy').should('exist');
    });
  });
});
