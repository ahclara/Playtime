/// <reference types="cypress" />

/**
 * 4. Estoque — testes de INTERFACE (modal "Ajustar estoque" em /admin/produtos)
 * O campo do modal recebe a quantidade de entrada (+) ou saída (−).
 */
interface Produto {
  id_produto: number;
  nome: string;
  preco_unitario: number;
  estoque: number;
}

describe('4. Estoque (interface)', () => {
  let produtos: Produto[];

  beforeEach(() => {
    cy.bloquearApiNaoMockada();
    produtos = [{ id_produto: 1, nome: 'Kissy Missy', preco_unitario: 36, estoque: 47 }];
    cy.intercept('GET', '**/api/produtos*', (req) => req.reply(produtos)).as('produtos');
    cy.intercept('PATCH', '**/api/produtos/1/estoque', (req) => {
      const novo = produtos[0].estoque + Number(req.body.quantidade);
      produtos[0] = { ...produtos[0], estoque: novo };
      req.reply({ statusCode: 200, body: { mensagem: 'Estoque atualizado com sucesso!', estoque_atual: novo } });
    }).as('estoque');

    cy.visitComo('gerente', '/admin/produtos');
    cy.wait('@produtos');
    cy.get('[aria-label="Ajustar estoque de Kissy Missy"]').click();
  });

  const modal = () => cy.get('[role="dialog"][aria-label="Ajustar estoque"]');

  describe('Atualização de Estoque', () => {
    it('CORRETO: Gerente atualiza estoque com valor válido', () => {
      modal().within(() => {
        cy.contains('tem hoje').should('contain.text', '47');
        cy.campo('Quantidade').definirValor(10);
        cy.contains('Novo estoque:').should('contain.text', '57');
        cy.contains('button', 'Atualizar').click();
      });

      cy.wait('@estoque').its('request.body').should('deep.equal', { quantidade: 10 });
      cy.contains('Estoque atualizado.').should('be.visible');
      modal().should('not.exist');
      cy.contains('tr', 'Kissy Missy').should('contain.text', '57 un');
    });

    it('INCORRETO: Atualização de estoque com valor negativo', () => {
      // estoque atual = 47; tirar 50 deixaria o estoque em −3
      modal().within(() => {
        cy.campo('Quantidade').definirValor(-50);
        cy.contains('button', 'Atualizar').click();
      });

      cy.contains(/negativ|inválid|insuficiente/i).should('be.visible'); // mensagem de validação
      cy.get('@estoque.all').should('have.length', 0);
      cy.contains('tr', 'Kissy Missy').should('contain.text', '47 un');
    });
  });
});
