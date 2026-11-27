/// <reference types="cypress" />
import { unico } from '../../support/dados';

/**
 * 3. Gerenciamento de Produtos — testes de API (back-end Flask real)
 */
describe('3. Gerenciamento de Produtos (API)', () => {
  let tokenGerente: string;
  let tokenVendedor: string;

  before(() => {
    cy.tokenDe('gerente').then((t) => (tokenGerente = t));
    cy.tokenDe('vendedor').then((t) => (tokenVendedor = t));
  });

  // -------------------------------------------------------------------------
  describe('Consulta de Produtos', () => {
    it('CORRETO: Listagem de produtos disponíveis', () => {
      cy.novoProduto(tokenGerente, { categoria: 'Pelúcia' }).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('GET', '/produtos', { token: cliente.token }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array').and.not.be.empty;
            const item = res.body.find((p: any) => p.id_produto === produto.id_produto);
            expect(item, 'produto cadastrado aparece na lista').to.exist;
            expect(item).to.include.all.keys('id_produto', 'nome', 'preco_unitario', 'estoque', 'categoria');
            expect(item).to.include({ nome: produto.nome, preco_unitario: 50, estoque: 10, categoria: 'Pelúcia' });
          });
        });
      });
    });

    it('INCORRETO: Consulta de produto com ID inexistente', () => {
      cy.api('GET', '/produtos/99999999', { token: tokenVendedor }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.erro).to.eq('Produto não encontrado');
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Cadastro de Produto', () => {
    it('CORRETO: Gerente cadastra produto com dados válidos', () => {
      const dados = { nome: `Robô ${unico()}`, descricao: 'Robô com luzes', preco_unitario: 199.9, estoque: 15, categoria: 'Robôs' };
      cy.api('POST', '/produtos', { token: tokenGerente, body: dados }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.include({ nome: dados.nome, preco_unitario: dados.preco_unitario, estoque: dados.estoque });
        const id = res.body.id_produto;
        cy.api('GET', '/produtos', { token: tokenGerente }).then((lista) => {
          const item = lista.body.find((p: any) => p.id_produto === id);
          expect(item, 'aparece na listagem').to.exist;
          expect(item).to.include({ categoria: dados.categoria, descricao: dados.descricao });
        });
      });
    });

    it('INCORRETO: Cadastro com preço negativo', () => {
      const nome = `Preço Negativo ${unico()}`;
      cy.api('POST', '/produtos', { token: tokenGerente, body: { nome, preco_unitario: -10, estoque: 5 } }).then((res) => {
        expect(res.status, 'cadastro deve ser impedido').to.eq(400);
        expect(res.body.erro).to.match(/preço|preco|negativ|inválid/i);
      });
      cy.api('GET', '/produtos', { token: tokenGerente })
        .its('body')
        .then((lista: any[]) => expect(lista.map((p) => p.nome)).not.to.include(nome));
    });
  });

  // -------------------------------------------------------------------------
  describe('Atualização de Produto', () => {
    it('CORRETO: Atualização de preço de produto', () => {
      cy.novoProduto(tokenGerente).then((produto) => {
        cy.api('PUT', `/produtos/${produto.id_produto}`, { token: tokenGerente, body: { preco_unitario: 74.9 } }).its('status').should('eq', 200);
        cy.api('GET', `/produtos/${produto.id_produto}`, { token: tokenGerente }).its('body.preco_unitario').should('eq', 74.9);
        cy.api('GET', '/produtos', { token: tokenGerente })
          .its('body')
          .then((lista: any[]) => expect(lista.find((p) => p.id_produto === produto.id_produto).preco_unitario).to.eq(74.9));
      });
    });

    it('INCORRETO: Vendedor tenta editar produto', () => {
      cy.novoProduto(tokenGerente).then((produto) => {
        cy.api('PUT', `/produtos/${produto.id_produto}`, { token: tokenVendedor, body: { preco_unitario: 1 } }).its('status').should('eq', 403);
        cy.api('GET', `/produtos/${produto.id_produto}`, { token: tokenGerente }).its('body.preco_unitario').should('eq', 50);
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Exclusão de Produto', () => {
    it('CORRETO: Exclusão de produto sem vendas vinculadas', () => {
      cy.novoProduto(tokenGerente).then((produto) => {
        cy.api('DELETE', `/produtos/${produto.id_produto}`, { token: tokenGerente }).its('status').should('eq', 200);
        cy.api('GET', `/produtos/${produto.id_produto}`, { token: tokenGerente }).its('status').should('eq', 404);
      });
    });

    it('INCORRETO: Exclusão de produto vinculado a vendas', () => {
      cy.novoProduto(tokenGerente).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/comprar', {
            token: cliente.token,
            body: { itens: [{ id_produto: produto.id_produto, quantidade: 1 }] },
          }).its('status').should('eq', 201);
        });

        cy.api('DELETE', `/produtos/${produto.id_produto}`, { token: tokenGerente }).then((res) => {
          expect(res.status, 'exclusão deve ser impedida com erro de regra (4xx)').to.be.within(400, 499);
          expect(res.body.erro).to.match(/vendas vinculadas|possui vendas/i);
        });
        cy.api('GET', `/produtos/${produto.id_produto}`, { token: tokenGerente }).its('status').should('eq', 200);
      });
    });
  });
});
