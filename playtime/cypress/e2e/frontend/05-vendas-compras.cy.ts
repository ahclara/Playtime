/// <reference types="cypress" />
import { brl, CHAVE_CARRINHO } from '../../support/dados';
import type { ItemCarrinho } from '../../support/commands';

/**
 * 5. Vendas e Compras — testes de INTERFACE
 * (/produtos → /carrinho → /finalizar → /compras e /admin/vendas)
 */
interface Venda {
  id_venda: number;
  id_cliente: number;
  nome_cliente?: string;
  data_venda: string;
  valor_total: number;
  status: 'pendente' | 'pago' | 'cancelado';
  metodo_pagamento?: string;
  itens?: any[];
}

const KISSY: ItemCarrinho = { id_produto: 1, nome: 'Kissy Missy', preco_unitario: 36, quantidade: 2, estoque: 47 };

describe('5. Vendas e Compras (interface)', () => {
  let vendas: Venda[];

  beforeEach(() => {
    cy.bloquearApiNaoMockada();
    cy.intercept('GET', '**/api/produtos*', { fixture: 'produtos.json' }).as('produtos');
    cy.fixture('vendas.json').then((lista: Venda[]) => {
      vendas = [...lista];
      cy.intercept('GET', '**/api/vendas', (req) => req.reply(vendas)).as('listarVendas');
      cy.intercept('GET', '**/api/compras/cliente', (req) => req.reply(vendas.filter((v) => v.id_cliente === 3))).as('minhasCompras');
    });
  });

  const carrinhoSalvo = () => cy.window().then((win) => JSON.parse(win.localStorage.getItem(CHAVE_CARRINHO) || '[]'));

  // -------------------------------------------------------------------------
  describe('Cliente Compra Produto', () => {
    it('CORRETO: Compra de produto com estoque disponível', () => {
      cy.intercept('POST', '**/api/vendas/comprar', (req) => {
        vendas.unshift({ id_venda: 501, id_cliente: 3, data_venda: '2026-11-27T15:00:00', valor_total: 72, status: 'pendente' });
        req.reply({ statusCode: 201, body: { id_venda: 501, id_cliente: 3, status: 'pendente', valor_total: 72 } });
      }).as('comprar');
      cy.intercept('POST', '**/api/vendas/501/finalizar', (req) => {
        vendas[0].status = 'pago';
        req.reply({ statusCode: 200, body: { mensagem: 'Venda finalizada com sucesso!', status: 'pago', valor_total: 72 } });
      }).as('finalizar');

      // seleciona o produto
      cy.visitComo('cliente', '/produtos');
      cy.wait('@produtos');
      cy.contains('article', 'Kissy Missy').contains('button', 'Comprar').click();
      cy.contains('Kissy Missy foi pra sua caixa!').should('be.visible');

      // informa a quantidade
      cy.get('a[aria-label^="Carrinho"]').click();
      cy.location('pathname').should('eq', '/carrinho');
      cy.get('button[aria-label="Aumentar"]').click();
      cy.get('[aria-label="Quantidade"]').should('contain.text', '2');
      cy.get('aside').contains(brl(72)).should('exist'); // total calculado

      // vai para a finalização / simulação de pagamento
      cy.contains('a', 'Finalizar compra').click();
      cy.location('pathname').should('eq', '/finalizar');
      cy.contains('label', 'PIX').click();
      cy.get('aside').should('contain.text', 'PIX').contains(brl(72)).should('exist');
      cy.contains('button', 'Confirmar compra').click();

      cy.wait('@comprar').its('request.body').should('deep.equal', {
        itens: [{ id_produto: 1, quantidade: 2 }],
        metodo_pagamento: 'pix',
      });
      cy.wait('@finalizar').its('response.body.status').should('eq', 'pago');
      cy.contains('Compra finalizada com sucesso!').should('be.visible');
      cy.location('pathname').should('eq', '/compras');
      cy.contains('tr', '#501').should('contain.text', 'pago').contains(brl(72)).should('exist');
      carrinhoSalvo().should('have.length', 0);
    });

    it('INCORRETO: Compra com estoque insuficiente', () => {
      cy.intercept('POST', '**/api/vendas/comprar', {
        statusCode: 400,
        body: { erro: 'Estoque insuficiente para Huggy Wuggy' },
      }).as('comprar');
      cy.intercept('POST', '**/api/vendas/*/finalizar').as('finalizar');

      // na vitrine, não deixa colocar mais do que o estoque (Huggy Wuggy tem 40 unidades)
      cy.visitComo('cliente', '/produtos', {
        carrinho: [{ id_produto: 2, nome: 'Huggy Wuggy', preco_unitario: 35.99, quantidade: 40, estoque: 40 }],
      });
      cy.wait('@produtos');
      cy.contains('article', 'Huggy Wuggy').contains('button', 'Comprar').click();
      cy.contains('Quantidade máxima atingida.').should('be.visible');
      cy.visit('/carrinho');
      cy.get('button[aria-label="Aumentar"]').should('be.disabled');

      // se o estoque acabou no servidor, a compra é recusada
      cy.contains('a', 'Finalizar compra').click();
      cy.contains('button', 'Confirmar compra').click();
      cy.wait('@comprar');
      cy.contains(/Estoque insuficiente/).should('be.visible');
      cy.location('pathname').should('eq', '/finalizar');
      cy.get('@finalizar.all').should('have.length', 0);
      carrinhoSalvo().should('have.length', 1); // nada foi comprado
    });
  });

  // -------------------------------------------------------------------------
  describe('Venda Direta pelo Vendedor', () => {
    it('CORRETO: Vendedor realiza venda direta finalizada', () => {
      // vendedor com um cliente vinculado ao seu usuário (a tela usa user.id_cliente) — Ana Clara (id 3)
      cy.intercept('POST', '**/api/vendas/pendente', (req) => {
        req.reply({ statusCode: 201, body: { id_venda: 77, status: 'pendente', valor_total: 72 } });
      }).as('criarVenda');
      cy.intercept('POST', '**/api/vendas/77/finalizar', (req) => {
        vendas.unshift({ id_venda: 77, id_cliente: 3, nome_cliente: 'Ana Clara', data_venda: '2026-11-27T15:00:00', valor_total: 72, status: 'pago' });
        req.reply({ statusCode: 200, body: { mensagem: 'Venda finalizada com sucesso!', status: 'pago', valor_total: 72 } });
      }).as('finalizar');

      cy.visitComo('vendedor', '/finalizar', { usuario: { id_cliente: 3 }, carrinho: [KISSY] });
      cy.contains('label', 'Crédito').click(); // método de pagamento
      cy.contains('button', 'Confirmar compra').click();

      cy.wait('@criarVenda').its('request.body').should('deep.equal', {
        id_cliente: 3,
        itens: [{ id_produto: 1, quantidade: 2 }],
        metodo_pagamento: 'cartao_credito',
      });
      cy.wait('@finalizar').its('response.body.status').should('eq', 'pago');
      cy.contains('Compra finalizada com sucesso!').should('be.visible');
      carrinhoSalvo().should('have.length', 0);

      // a venda aparece como finalizada (pago) no balcão
      cy.location('pathname', { timeout: 30000 }).should('eq', '/compras');
      cy.get('nav[aria-label="Principal"]').contains('a', 'Balcão').click();
      cy.location('pathname', { timeout: 30000 }).should('eq', '/admin/vendas');
      cy.wait('@listarVendas');
      cy.contains('tr', '#77').should('contain.text', 'pago');
    });

    it('INCORRETO: Venda sem itens no carrinho', () => {
      cy.intercept('POST', '**/api/vendas/**').as('criarVenda');

      cy.visitComo('vendedor', '/finalizar', { usuario: { id_cliente: 3 }, carrinho: [] });

      cy.location('pathname').should('eq', '/carrinho');
      cy.contains(/carrinho vazio|caixa está vazia/i).should('be.visible');
      cy.contains('a', 'Finalizar compra').should('not.exist');
      cy.get('@criarVenda.all').should('have.length', 0);
    });
  });

  // -------------------------------------------------------------------------
  describe('Venda Pendente', () => {
    it('CORRETO: Criação de venda pendente com itens', () => {
      cy.intercept('POST', '**/api/vendas/pendente', (req) => {
        vendas.unshift({ id_venda: 88, id_cliente: 3, nome_cliente: 'Ana Clara', data_venda: '2026-11-27T15:00:00', valor_total: 72, status: 'pendente' });
        req.reply({ statusCode: 201, body: { mensagem: 'Venda pendente criada com sucesso!', id_venda: 88, status: 'pendente', valor_total: 72 } });
      }).as('criarPendente');
      // o pagamento não é concluído agora: a venda fica pendente para depois
      cy.intercept('POST', '**/api/vendas/88/finalizar', { statusCode: 400, body: { erro: 'Falha no processamento do pagamento' } }).as('finalizar');
      cy.intercept('GET', '**/api/vendas/88', {
        id_venda: 88, id_cliente: 3, nome_cliente: 'Ana Clara', data_venda: '2026-11-27T15:00:00', valor_total: 72, status: 'pendente',
        itens: [{ id_item: 1, id_produto: 1, nome_produto: 'Kissy Missy', quantidade: 2, preco_unitario: 36, subtotal: 72 }],
      }).as('detalhe');

      cy.visitComo('vendedor', '/finalizar', { usuario: { id_cliente: 3 }, carrinho: [KISSY] });
      cy.contains('button', 'Confirmar compra').click();
      cy.wait('@criarPendente').its('response.body.status').should('eq', 'pendente');
      cy.wait('@finalizar');

      cy.visitComo('vendedor', '/admin/vendas');
      cy.wait('@listarVendas');
      cy.contains('tr', '#88').should('contain.text', 'pendente');
      cy.get('[aria-label="Ver pedido 88"]').click();
      cy.wait('@detalhe');
      cy.get('[role="dialog"][aria-label="Pedido #88"]').within(() => {
        cy.contains('pendente').should('exist');
        cy.contains('Kissy Missy').should('exist');
        cy.contains('2 ×').should('exist');
      });
    });

    it('INCORRETO: Acesso a venda inexistente', () => {
      vendas.unshift({ id_venda: 404, id_cliente: 6, nome_cliente: 'José Bezerra', data_venda: '2026-11-27T15:00:00', valor_total: 10, status: 'pendente' });
      cy.intercept('GET', '**/api/vendas/404', { statusCode: 404, body: { erro: 'Venda não encontrada' } }).as('detalhe');
      cy.intercept('POST', '**/api/vendas/404/finalizar', { statusCode: 404, body: { erro: 'Venda não encontrada' } }).as('finalizar');

      cy.visitComo('vendedor', '/admin/vendas');
      cy.wait('@listarVendas');

      cy.get('[aria-label="Ver pedido 404"]').click();
      cy.wait('@detalhe');
      cy.contains('Venda não encontrada').should('be.visible');
      cy.get('[role="dialog"]').should('not.exist');

      cy.get('[aria-label="Finalizar pedido 404"]').click();
      cy.wait('@finalizar');
      cy.contains('Venda não encontrada').should('be.visible');
      cy.contains('tr', '#404').should('contain.text', 'pendente');
    });
  });

  // -------------------------------------------------------------------------
  describe('Finalizar Compra Pendente', () => {
    it('CORRETO: Cliente finaliza compra pendente com estoque disponível', () => {
      cy.intercept('POST', '**/api/vendas/37/finalizar', (req) => {
        vendas = vendas.map((v) => (v.id_venda === 37 ? { ...v, status: 'pago' } : v));
        req.reply({ statusCode: 200, body: { mensagem: 'Venda finalizada com sucesso!', status: 'pago', valor_total: 72 } });
      }).as('finalizar');

      cy.visitComo('cliente', '/compras');
      cy.wait('@minhasCompras');
      cy.contains('tr', '#37').should('contain.text', 'pendente').contains('button', 'Finalizar').click();

      cy.wait('@finalizar').its('response.body.status').should('eq', 'pago');
      cy.contains('Venda finalizada!').should('be.visible');
      cy.contains('tr', '#37').should('contain.text', 'pago');
      cy.contains('tr', '#37').contains('button', 'Finalizar').should('not.exist');
    });

    it('INCORRETO: Cliente finaliza compra pendente com produto sem estoque', () => {
      cy.intercept('POST', '**/api/vendas/37/finalizar', {
        statusCode: 400,
        body: { erro: 'Estoque insuficiente para Kissy Missy' },
      }).as('finalizar');

      cy.visitComo('cliente', '/compras');
      cy.wait('@minhasCompras');
      cy.contains('tr', '#37').contains('button', 'Finalizar').click();

      cy.wait('@finalizar');
      cy.contains('Estoque insuficiente para Kissy Missy').should('be.visible'); // informa o produto
      cy.contains('tr', '#37').should('contain.text', 'pendente');
    });
  });

  // -------------------------------------------------------------------------
  describe('Consultar Vendas Realizadas', () => {
    it('CORRETO: Vendedor consulta lista de vendas', () => {
      cy.visitComo('vendedor', '/admin/vendas');
      cy.wait('@listarVendas');

      cy.get('table thead').should('contain.text', 'Cliente').and('contain.text', 'Data').and('contain.text', 'Total').and('contain.text', 'Status');
      cy.get('table tbody tr').should('have.length', vendas.length);
      cy.contains('tr', '#37').within(() => {
        cy.contains('Ana Clara').should('exist');
        cy.contains('20/11/2026').should('exist');
        cy.contains(brl(72)).should('exist');
        cy.contains('pendente').should('exist');
      });
      cy.contains('tr', '#8').should('contain.text', 'José Bezerra').and('contain.text', 'pago');
    });

    it('INCORRETO: Cliente tenta acessar a lista geral de vendas', () => {
      cy.visitComo('cliente', '/admin/vendas');

      cy.location('pathname').should('eq', '/produtos');
      cy.get('@listarVendas.all').should('have.length', 0);

      // continua com acesso apenas às próprias compras
      cy.visitComo('cliente', '/compras');
      cy.wait('@minhasCompras');
      cy.get('table tbody tr').should('have.length', 1);
      cy.contains('José Bezerra').should('not.exist');
    });
  });

  // -------------------------------------------------------------------------
  describe('Cancelar Venda', () => {
    it('CORRETO: Gerente cancela venda pendente', () => {
      const motivo = 'Cliente desistiu da compra';
      cy.intercept('POST', '**/api/vendas/37/cancelar', (req) => {
        vendas = vendas.map((v) => (v.id_venda === 37 ? { ...v, status: 'cancelado' } : v));
        req.reply({ statusCode: 200, body: { mensagem: 'Venda cancelada com sucesso!', id_venda: 37, status: 'cancelado', motivo: req.body.motivo } });
      }).as('cancelar');
      cy.intercept('GET', '**/api/cancelamentos', [
        { id_cancelamento: 1, id_venda: 37, id_cliente: 3, motivo, data_cancelamento: '2026-11-27T15:00:00' },
      ]).as('cancelamentos');

      cy.visitComo('gerente', '/admin/vendas');
      cy.wait('@listarVendas');
      cy.get('[aria-label="Cancelar pedido 37"]').click();
      cy.get('[role="dialog"][aria-label="Cancelar pedido #37"]').within(() => {
        cy.campo('Motivo').type(motivo);
        cy.contains('button', 'Cancelar venda').click();
      });

      cy.wait('@cancelar').its('request.body').should('deep.equal', { motivo });
      cy.contains('Venda cancelada.').should('be.visible');
      cy.contains('tr', '#37').should('contain.text', 'cancelado');

      // cancelamento registrado com o motivo
      cy.get('nav[aria-label="Gerência"]').contains('a', 'Cancelamentos').click();
      cy.wait('@cancelamentos');
      cy.contains('tr', '#37').should('contain.text', motivo);
    });

    it('INCORRETO: Vendedor tenta cancelar venda', () => {
      cy.intercept('POST', '**/api/vendas/*/cancelar').as('cancelar');

      cy.visitComo('vendedor', '/admin/vendas');
      cy.wait('@listarVendas');
      cy.contains('tr', '#37').within(() => {
        cy.get('[aria-label="Finalizar pedido 37"]').should('exist');
        cy.get('[aria-label="Cancelar pedido 37"]').should('not.exist');
      });
      cy.get('nav[aria-label="Balcão"]').should('not.contain.text', 'Cancelamentos');
      cy.get('@cancelar.all').should('have.length', 0);
    });
  });
});
