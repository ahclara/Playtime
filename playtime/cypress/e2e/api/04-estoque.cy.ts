/// <reference types="cypress" />

/**
 * 4. Estoque — testes de API (PATCH /api/produtos/:id/estoque)
 * A rota soma `quantidade` ao estoque atual (entrada positiva, saída negativa).
 */
describe('4. Estoque (API)', () => {
  let tokenGerente: string;

  before(() => {
    cy.tokenDe('gerente').then((t) => (tokenGerente = t));
  });

  describe('Atualização de Estoque', () => {
    it('CORRETO: Gerente atualiza estoque com valor válido', () => {
      cy.novoProduto(tokenGerente, { estoque: 5 }).then((produto) => {
        cy.api('PATCH', `/produtos/${produto.id_produto}/estoque`, { token: tokenGerente, body: { quantidade: 10 } }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.estoque_atual).to.eq(15);
        });
        cy.api('GET', `/produtos/${produto.id_produto}`, { token: tokenGerente }).its('body.estoque').should('eq', 15);
      });
    });

    it('INCORRETO: Atualização de estoque com valor negativo', () => {
      cy.novoProduto(tokenGerente, { estoque: 5 }).then((produto) => {
        // 5 − 8 deixaria o estoque negativo
        cy.api('PATCH', `/produtos/${produto.id_produto}/estoque`, { token: tokenGerente, body: { quantidade: -8 } }).then((res) => {
          expect(res.status, 'operação deve ser rejeitada').to.eq(400);
          expect(res.body.erro).to.match(/negativ|inválid|insuficiente/i);
        });
        cy.api('GET', `/produtos/${produto.id_produto}`, { token: tokenGerente }).its('body.estoque').should('eq', 5);
      });
    });
  });
});
