/// <reference types="cypress" />
import { unico } from '../../support/dados';

/**
 * 2. Gerenciamento de Clientes — testes de API (back-end Flask real)
 */
describe('2. Gerenciamento de Clientes (API)', () => {
  let tokenGerente: string;
  let tokenVendedor: string;

  before(() => {
    cy.tokenDe('gerente').then((t) => (tokenGerente = t));
    cy.tokenDe('vendedor').then((t) => (tokenVendedor = t));
  });

  const dadosCliente = () => {
    const id = unico();
    return { nome: `Cliente Balcão ${id}`, cpf: id, email: `balcao.${id}@teste.com` };
  };

  // -------------------------------------------------------------------------
  describe('Cadastro de Cliente pelo Vendedor/Gerente', () => {
    it('CORRETO: Vendedor cadastra novo cliente', () => {
      const dados = dadosCliente();
      cy.api('POST', '/clientes', { token: tokenVendedor, body: dados }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.include(dados);
        const id = res.body.id_cliente;

        cy.api('GET', '/clientes', { token: tokenVendedor }).then((lista) => {
          expect(lista.status).to.eq(200);
          expect(lista.body.map((c: any) => c.id_cliente)).to.include(id); // aparece na listagem
        });
      });
    });

    it('INCORRETO: Cliente tenta cadastrar outro cliente', () => {
      cy.novoCliente().then((cliente) => {
        const dados = dadosCliente();
        cy.api('POST', '/clientes', { token: cliente.token, body: dados }).then((res) => {
          expect(res.status, 'acesso negado por RBAC').to.eq(403);
        });
        cy.api('GET', '/clientes', { token: cliente.token }).its('status').should('eq', 403);
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Atualização de Cliente', () => {
    it('CORRETO: Atualização de dados válidos', () => {
      const dados = dadosCliente();
      cy.api('POST', '/clientes', { token: tokenVendedor, body: dados }).then((criado) => {
        const id = criado.body.id_cliente;
        const novoEmail = `novo.${unico()}@teste.com`;

        cy.api('PUT', `/clientes/${id}`, { token: tokenVendedor, body: { email: novoEmail } }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.email).to.eq(novoEmail);
        });
        cy.api('GET', `/clientes/${id}`, { token: tokenVendedor }).its('body.email').should('eq', novoEmail);
      });
    });

    it('INCORRETO: Atualização de cliente inexistente', () => {
      cy.api('PUT', '/clientes/99999999', { token: tokenVendedor, body: { email: `x.${unico()}@teste.com` } }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.erro).to.eq('Cliente não encontrado');
      });
      cy.api('GET', '/clientes/99999999', { token: tokenVendedor }).its('status').should('eq', 404);
    });
  });

  // -------------------------------------------------------------------------
  describe('Exclusão de Cliente', () => {
    it('CORRETO: Gerente exclui cliente sem vendas vinculadas', () => {
      cy.api('POST', '/clientes', { token: tokenGerente, body: dadosCliente() }).then((criado) => {
        const id = criado.body.id_cliente;
        cy.api('DELETE', `/clientes/${id}`, { token: tokenGerente }).its('status').should('eq', 200);
        cy.api('GET', `/clientes/${id}`, { token: tokenGerente }).its('status').should('eq', 404);
        cy.api('GET', '/clientes', { token: tokenGerente })
          .its('body')
          .then((lista: any[]) => expect(lista.map((c) => c.id_cliente)).not.to.include(id));
      });
    });

    it('INCORRETO: Vendedor tenta excluir cliente', () => {
      cy.api('POST', '/clientes', { token: tokenGerente, body: dadosCliente() }).then((criado) => {
        const id = criado.body.id_cliente;
        cy.api('DELETE', `/clientes/${id}`, { token: tokenVendedor }).its('status').should('eq', 403);
        cy.api('GET', `/clientes/${id}`, { token: tokenGerente }).its('status').should('eq', 200); // continua lá
      });
    });
  });
});
