/// <reference types="cypress" />
import { brl } from '../../support/dados';

/**
 * 6. Relatórios — testes de INTERFACE (/admin/relatorios)
 *
 * Obs.: "Vendas por Período" não tem tela no front-end (só a rota da API),
 * por isso esse cenário está coberto apenas em cypress/e2e/api/06-relatorios.cy.ts.
 */
describe('6. Relatórios (interface)', () => {
  beforeEach(() => {
    cy.bloquearApiNaoMockada();
    cy.fixture('relatorio-geral.json').as('geral');
  });

  // -------------------------------------------------------------------------
  describe('Relatório Geral', () => {
    it('CORRETO: Gerente gera relatório geral', function () {
      cy.intercept('GET', '**/api/relatorios/geral', this.geral).as('relGeral');

      cy.visitComo('gerente', '/admin/relatorios');
      cy.wait('@relGeral').its('response.statusCode').should('eq', 200);

      const cartao = (rotulo: string) => cy.contains('p', rotulo).parent();
      cartao('Clientes').should('contain.text', '16');
      cartao('Produtos').should('contain.text', '7');
      cartao('Vendas concluídas').should('contain.text', '26');
      cartao('Total arrecadado').contains(brl(2450.75)).should('exist');
      cy.contains('Melhores clientes').parent().should('contain.text', 'José Bezerra');
    });

    it('INCORRETO: Vendedor tenta acessar relatório geral', () => {
      cy.intercept('GET', '**/api/relatorios/geral').as('relGeral');

      cy.visitComo('vendedor', '/admin/relatorios');

      cy.location('pathname').should('eq', '/admin/clientes');
      cy.get('nav[aria-label="Balcão"]').should('not.contain.text', 'Relatórios');
      cy.get('@relGeral.all').should('have.length', 0);
    });
  });

  // -------------------------------------------------------------------------
  describe('Produtos Mais Vendidos', () => {
    it('CORRETO: Consulta de produtos mais vendidos (ordenada pela quantidade)', function () {
      cy.intercept('GET', '**/api/relatorios/geral', this.geral).as('relGeral');

      cy.visitComo('gerente', '/admin/relatorios');
      cy.wait('@relGeral');

      cy.contains('h3', 'Produtos mais vendidos')
        .parent()
        .find('ol > li')
        .should('have.length', 3)
        .then(($itens) => {
          const textos = [...$itens].map((li) => li.textContent || '');
          expect(textos[0]).to.contain('CatNap').and.contain('42 un');
          expect(textos[1]).to.contain('Pianosaurus').and.contain('25 un');
          expect(textos[2]).to.contain('Kissy Missy').and.contain('9 un');
          const quantidades = textos.map((t) => Number(/(\d+) un/.exec(t)![1]));
          expect(quantidades).to.deep.equal([...quantidades].sort((a, b) => b - a));
        });
    });

    it('INCORRETO: Consulta sem vendas registradas (lista vazia, sem erro)', () => {
      cy.intercept('GET', '**/api/relatorios/geral', {
        total_clientes: 16,
        total_produtos: 7,
        total_vendas_concluidas: 0,
        total_arrecadado: 0,
        produtos_mais_vendidos: [],
        clientes_top: [],
      }).as('relGeral');

      cy.visitComo('gerente', '/admin/relatorios');
      cy.wait('@relGeral');

      cy.contains('h3', 'Produtos mais vendidos').parent().within(() => {
        cy.get('ol').should('not.exist');
        cy.contains(/Nenhum dado ainda|Nenhuma venda registrada/).should('be.visible');
      });
      cy.contains('Erro ao carregar').should('not.exist');
    });
  });
});
