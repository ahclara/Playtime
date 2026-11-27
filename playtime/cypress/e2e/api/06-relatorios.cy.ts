/// <reference types="cypress" />

/**
 * 6. Relatórios — testes de API (back-end Flask real)
 */
describe('6. Relatórios (API)', () => {
  let tokenGerente: string;
  let tokenVendedor: string;

  const hoje = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const amanha = iso(new Date(hoje.getTime() + 24 * 3600 * 1000));
  const semanaPassada = iso(new Date(hoje.getTime() - 7 * 24 * 3600 * 1000));

  before(() => {
    cy.tokenDe('gerente').then((t) => (tokenGerente = t));
    cy.tokenDe('vendedor').then((t) => (tokenVendedor = t));
  });

  /** Registra uma venda paga de `quantidade` unidades de um produto novo. */
  const vendaPaga = (quantidade: number) =>
    cy.novoProduto(tokenGerente, { estoque: 50 }).then((produto) =>
      cy.novoCliente().then((cliente) =>
        cy
          .api('POST', '/vendas/direta', {
            token: tokenVendedor,
            body: { id_cliente: cliente.id_cliente, itens: [{ id_produto: produto.id_produto, quantidade }] },
          })
          .then((res) => {
            expect(res.status).to.eq(200);
            return { produto, id_venda: res.body.id_venda as number };
          }),
      ),
    );

  // -------------------------------------------------------------------------
  describe('Relatório Geral', () => {
    it('CORRETO: Gerente gera relatório geral', () => {
      vendaPaga(1);
      cy.api('GET', '/relatorios/geral', { token: tokenGerente }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.include.all.keys('total_vendas_concluidas', 'total_arrecadado', 'total_clientes');
        expect(res.body.total_vendas_concluidas).to.be.greaterThan(0);
        expect(res.body.total_arrecadado).to.be.greaterThan(0);
        expect(res.body.total_clientes).to.be.greaterThan(0);
      });
    });

    it('INCORRETO: Vendedor tenta acessar relatório geral', () => {
      cy.api('GET', '/relatorios/geral', { token: tokenVendedor }).then((res) => {
        expect(res.status).to.eq(403);
        expect(res.body).not.to.have.property('total_arrecadado');
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Vendas por Período', () => {
    it('CORRETO: Consulta de vendas em período válido', () => {
      vendaPaga(1).then(({ id_venda }) => {
        cy.api('GET', `/relatorios/vendas-periodo?data_inicio=${semanaPassada}&data_fim=${amanha}`, { token: tokenGerente }).then((res) => {
          expect(res.status).to.eq(200);
          const vendas = res.body.vendas ?? res.body;
          expect(vendas.map((v: any) => v.id_venda)).to.include(id_venda);
          vendas.forEach((v: any) => {
            const data = String(v.data_venda);
            expect(new Date(data).getTime()).to.be.within(new Date(semanaPassada).getTime(), new Date(amanha).getTime() + 24 * 3600 * 1000);
          });
        });
      });
    });

    it('INCORRETO: Consulta com data final anterior à inicial', () => {
      cy.api('GET', `/relatorios/vendas-periodo?data_inicio=${amanha}&data_fim=${semanaPassada}`, { token: tokenGerente }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.erro).to.match(/intervalo|data/i);
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Produtos Mais Vendidos', () => {
    it('CORRETO: Consulta de produtos mais vendidos', () => {
      vendaPaga(9);
      vendaPaga(4);
      cy.api('GET', `/relatorios/produtos-mais-vendidos?data_inicio=${semanaPassada}&data_fim=${amanha}`, { token: tokenGerente }).then((res) => {
        expect(res.status).to.eq(200);
        const lista: any[] = res.body.produtos_mais_vendidos ?? res.body;
        expect(lista).to.be.an('array').and.not.be.empty;
        const qtds = lista.map((p) => Number(p.total_vendido));
        expect(qtds, 'ordenado pela quantidade vendida').to.deep.equal([...qtds].sort((a, b) => b - a));
      });
    });

    it('INCORRETO: Consulta sem vendas registradas (período sem vendas)', () => {
      cy.api('GET', '/relatorios/produtos-mais-vendidos?data_inicio=1990-01-01&data_fim=1990-01-31', { token: tokenGerente }).then((res) => {
        expect(res.status, 'não deve gerar erro').to.eq(200);
        const lista = res.body.produtos_mais_vendidos ?? res.body;
        if (Array.isArray(lista)) expect(lista).to.have.length(0);
        else expect(res.body.mensagem).to.match(/nenhuma venda registrada/i);
      });
    });
  });
});
