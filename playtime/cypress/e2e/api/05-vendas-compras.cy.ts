/// <reference types="cypress" />

/**
 * 5. Vendas e Compras — testes de API (back-end Flask real)
 */
describe('5. Vendas e Compras (API)', () => {
  let tokenGerente: string;
  let tokenVendedor: string;

  before(() => {
    cy.tokenDe('gerente').then((t) => (tokenGerente = t));
    cy.tokenDe('vendedor').then((t) => (tokenVendedor = t));
  });

  const estoqueDe = (id: number) => cy.api('GET', `/produtos/${id}`, { token: tokenGerente }).its('body.estoque');

  // -------------------------------------------------------------------------
  describe('Cliente Compra Produto', () => {
    it('CORRETO: Compra de produto com estoque disponível', () => {
      cy.novoProduto(tokenGerente, { preco_unitario: 35.5, estoque: 10 }).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/comprar', {
            token: cliente.token,
            body: { itens: [{ id_produto: produto.id_produto, quantidade: 2 }], metodo_pagamento: 'pix' },
          }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body.id_venda).to.be.a('number');
            expect(res.body.valor_total).to.eq(71); // 2 × 35,50
            expect(res.body.itens).to.have.length(1);
            expect(res.body.status).to.eq('pendente'); // segue para a finalização/pagamento

            // simulação de pagamento
            cy.api('POST', `/vendas/${res.body.id_venda}/finalizar`, { token: cliente.token }).then((fin) => {
              expect(fin.status).to.eq(200);
              expect(fin.body.status).to.eq('pago');
            });
            cy.api('GET', `/vendas/${res.body.id_venda}`, { token: cliente.token }).then((venda) => {
              expect(venda.body.itens[0]).to.include({ id_produto: produto.id_produto, quantidade: 2 });
            });
          });
        });
      });
    });

    it('INCORRETO: Compra com estoque insuficiente', () => {
      cy.novoProduto(tokenGerente, { estoque: 3 }).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/comprar', {
            token: cliente.token,
            body: { itens: [{ id_produto: produto.id_produto, quantidade: 5 }] },
          }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body.erro).to.contain('Estoque insuficiente');
          });
          cy.api('GET', '/compras/cliente', { token: cliente.token }).its('body').should('have.length', 0);
          estoqueDe(produto.id_produto).should('eq', 3);
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Venda Direta pelo Vendedor', () => {
    it('CORRETO: Vendedor realiza venda direta finalizada', () => {
      cy.novoProduto(tokenGerente, { preco_unitario: 20, estoque: 10 }).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/direta', {
            token: tokenVendedor,
            body: { id_cliente: cliente.id_cliente, itens: [{ id_produto: produto.id_produto, quantidade: 3 }], metodo_pagamento: 'dinheiro' },
          }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.status).to.eq('pago'); // finalizada
            expect(res.body.valor_total).to.eq(60);

            cy.api('GET', `/vendas/${res.body.id_venda}`, { token: tokenVendedor }).then((venda) => {
              expect(venda.body.status).to.eq('pago');
              expect(venda.body.itens).to.have.length(1);
            });
          });
          estoqueDe(produto.id_produto).should('eq', 7); // baixa no estoque
        });
      });
    });

    it('INCORRETO: Venda sem itens no carrinho', () => {
      cy.novoCliente().then((cliente) => {
        cy.api('POST', '/vendas/direta', { token: tokenVendedor, body: { id_cliente: cliente.id_cliente, itens: [] } }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.erro).to.match(/carrinho vazio|venda sem itens/i);
        });
        cy.api('GET', '/compras/cliente', { token: cliente.token }).its('body').should('have.length', 0);
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Venda Pendente', () => {
    it('CORRETO: Criação de venda pendente com itens', () => {
      cy.novoProduto(tokenGerente, { estoque: 10 }).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/pendente', {
            token: tokenVendedor,
            body: { id_cliente: cliente.id_cliente, itens: [{ id_produto: produto.id_produto, quantidade: 2 }] },
          }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body.status).to.eq('pendente');

            cy.api('GET', `/vendas/${res.body.id_venda}`, { token: tokenVendedor }).then((venda) => {
              expect(venda.body.status).to.eq('pendente');
              expect(venda.body.itens).to.have.length(1);
              expect(venda.body.itens[0]).to.include({ id_produto: produto.id_produto, quantidade: 2 });
            });
          });
        });
      });
    });

    it('INCORRETO: Adição de item a venda inexistente', () => {
      cy.novoProduto(tokenGerente).then((produto) => {
        cy.api('POST', '/vendas/99999999/itens', {
          token: tokenVendedor,
          body: { produto_id: produto.id_produto, id_produto: produto.id_produto, quantidade: 1 },
        }).then((res) => {
          expect(res.status).to.eq(404);
          expect(res.body, 'resposta JSON da API com campo "erro"').to.be.an('object').and.have.property('erro');
          expect(res.body.erro).to.contain('Venda não encontrada');
        });
        cy.api('GET', '/vendas/99999999', { token: tokenVendedor }).its('status').should('eq', 404);
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Finalizar Compra Pendente', () => {
    it('CORRETO: Cliente finaliza compra pendente com estoque disponível', () => {
      cy.novoProduto(tokenGerente, { estoque: 10 }).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/comprar', {
            token: cliente.token,
            body: { itens: [{ id_produto: produto.id_produto, quantidade: 4 }] },
          }).then((compra) => {
            const id = compra.body.id_venda;
            cy.api('POST', `/vendas/${id}/finalizar`, { token: cliente.token }).then((res) => {
              expect(res.status).to.eq(200);
              expect(res.body.status).to.eq('pago');
            });
            cy.api('GET', `/vendas/${id}`, { token: cliente.token }).its('body.status').should('eq', 'pago');
            estoqueDe(produto.id_produto).should('eq', 6); // baixa no estoque
          });
        });
      });
    });

    it('INCORRETO: Cliente finaliza compra pendente com produto sem estoque', () => {
      cy.novoProduto(tokenGerente, { estoque: 2 }).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/comprar', {
            token: cliente.token,
            body: { itens: [{ id_produto: produto.id_produto, quantidade: 2 }] },
          }).then((compra) => {
            const id = compra.body.id_venda;
            // o produto ficou sem estoque antes da finalização
            cy.api('PATCH', `/produtos/${produto.id_produto}/estoque`, { token: tokenGerente, body: { quantidade: -2 } })
              .its('body.estoque_atual')
              .should('eq', 0);

            cy.api('POST', `/vendas/${id}/finalizar`, { token: cliente.token }).then((res) => {
              expect(res.status, 'finalização deve ser impedida').to.eq(400);
              expect(res.body.erro).to.contain(produto.nome); // informa qual produto está indisponível
            });
            cy.api('GET', `/vendas/${id}`, { token: cliente.token }).its('body.status').should('eq', 'pendente');
            estoqueDe(produto.id_produto).should('eq', 0);
          });
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Consultar Vendas Realizadas', () => {
    it('CORRETO: Vendedor consulta lista de vendas', () => {
      cy.novoProduto(tokenGerente).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/direta', {
            token: tokenVendedor,
            body: { id_cliente: cliente.id_cliente, itens: [{ id_produto: produto.id_produto, quantidade: 1 }] },
          }).then((venda) => {
            cy.api('GET', '/vendas', { token: tokenVendedor }).then((res) => {
              expect(res.status).to.eq(200);
              const v = res.body.find((x: any) => x.id_venda === venda.body.id_venda);
              expect(v, 'venda aparece na lista').to.exist;
              expect(v).to.include.all.keys('nome_cliente', 'data_venda', 'valor_total', 'status');
              expect(v.nome_cliente).to.eq(cliente.nome);
              expect(v.status).to.eq('pago');
            });
          });
        });
      });
    });

    it('INCORRETO: Cliente tenta acessar a lista geral de vendas', () => {
      cy.novoCliente().then((cliente) => {
        cy.api('GET', '/vendas', { token: cliente.token }).its('status').should('eq', 403);
        // continua restrito às próprias compras
        cy.api('GET', '/compras/cliente', { token: cliente.token }).then((res) => {
          expect(res.status).to.eq(200);
          res.body.forEach((v: any) => expect(v.id_cliente).to.eq(cliente.id_cliente));
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Cancelar Venda', () => {
    it('CORRETO: Gerente cancela venda pendente', () => {
      cy.novoProduto(tokenGerente, { estoque: 10 }).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/pendente', {
            token: tokenVendedor,
            body: { id_cliente: cliente.id_cliente, itens: [{ id_produto: produto.id_produto, quantidade: 3 }] },
          }).then((venda) => {
            const id = venda.body.id_venda;
            const motivo = 'Cliente desistiu da compra';
            cy.api('POST', `/vendas/${id}/cancelar`, { token: tokenGerente, body: { motivo } }).then((res) => {
              expect(res.status).to.eq(200);
              expect(res.body).to.include({ status: 'cancelado', motivo });
            });
            cy.api('GET', `/vendas/${id}`, { token: tokenGerente }).its('body.status').should('eq', 'cancelado');
            // os itens voltam/continuam disponíveis no estoque
            estoqueDe(produto.id_produto).should('eq', 10);
          });
        });
      });
    });

    it('INCORRETO: Vendedor tenta cancelar venda', () => {
      cy.novoProduto(tokenGerente).then((produto) => {
        cy.novoCliente().then((cliente) => {
          cy.api('POST', '/vendas/pendente', {
            token: tokenVendedor,
            body: { id_cliente: cliente.id_cliente, itens: [{ id_produto: produto.id_produto, quantidade: 1 }] },
          }).then((venda) => {
            const id = venda.body.id_venda;
            cy.api('POST', `/vendas/${id}/cancelar`, { token: tokenVendedor, body: { motivo: 'teste' } }).its('status').should('eq', 403);
            cy.api('GET', `/vendas/${id}`, { token: tokenGerente }).its('body.status').should('eq', 'pendente');
          });
        });
      });
    });
  });
});
