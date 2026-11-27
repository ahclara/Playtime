/// <reference types="cypress" />
import { unico } from '../../support/dados';

/**
 * 1. Autenticação e Cadastro — testes de API (back-end Flask real)
 * Pré-requisito: back-end rodando + `python scripts/seed_cypress.py`.
 */
describe('1. Autenticação e Cadastro (API)', () => {
  const JWT = /^[\w-]+\.[\w-]+\.[\w-]+$/;

  const novosDados = () => {
    const id = unico();
    return { nome: `Visitante ${id}`, cpf: id, email: `visitante.${id}@teste.com`, senha: 'senha123' };
  };

  // -------------------------------------------------------------------------
  describe('Login do Usuário', () => {
    it('CORRETO: Login realizado com sucesso', () => {
      cy.novoCliente().then((cliente) => {
        cy.api('POST', '/login', { body: { email: cliente.email, senha: cliente.senha } }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.token).to.match(JWT);
          expect(res.body.usuario).to.include({ email: cliente.email, perfil: 'cliente' });
        });
      });

      // perfis administrativos recebem o próprio perfil no token
      (['gerente', 'vendedor'] as const).forEach((perfil) => {
        cy.credenciaisDe(perfil).then((cred) => {
          cy.api('POST', '/login', { body: cred }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.token).to.match(JWT);
            expect(res.body.usuario.perfil).to.eq(perfil);
          });
        });
      });
    });

    it('INCORRETO: Login com senha incorreta', () => {
      cy.novoCliente().then((cliente) => {
        cy.api('POST', '/login', { body: { email: cliente.email, senha: 'senhaErrada' } }).then((res) => {
          expect(res.status).to.eq(401);
          expect(res.body.erro).to.match(/credenciais inválidas|e-?mail ou senha inválidos/i);
          expect(res.body).not.to.have.property('token');
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Cadastro de Cliente', () => {
    it('CORRETO: Cadastro de cliente com dados válidos', () => {
      const dados = novosDados();
      cy.api('POST', '/registrar', { body: dados }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.cliente).to.include({ nome: dados.nome, cpf: dados.cpf, email: dados.email });
        expect(res.body.usuario).to.include({ email: dados.email, perfil: 'cliente' });
        // a senha nunca volta na resposta (fica só o hash bcrypt no banco)
        expect(JSON.stringify(res.body)).not.to.contain(dados.senha);
      });
      // permite o login com a senha cadastrada (bcrypt.checkpw no back-end)
      cy.api('POST', '/login', { body: { email: dados.email, senha: dados.senha } }).its('status').should('eq', 200);
    });

    (['nome', 'cpf', 'email', 'senha'] as const).forEach((campo) => {
      it(`INCORRETO: Cadastro com campo obrigatório vazio (${campo})`, () => {
        const dados = { ...novosDados(), [campo]: '' };
        cy.api('POST', '/registrar', { body: dados }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.erro).to.contain(campo); // indica qual campo faltou
        });
        if (campo !== 'email') {
          cy.api('POST', '/verificar-email', { body: { email: dados.email } }).its('body.existe').should('eq', false);
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Verificação de E-mail já cadastrado', () => {
    it('CORRETO: Verificação de e-mail inédito', () => {
      const dados = novosDados();
      cy.api('POST', '/verificar-email', { body: { email: dados.email } }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.existe).to.eq(false);
      });
      cy.api('POST', '/registrar', { body: dados }).its('status').should('eq', 201);
      cy.api('POST', '/login', { body: { email: dados.email, senha: dados.senha } }).its('status').should('eq', 200);
    });

    it('INCORRETO: Tentativa de cadastro com e-mail duplicado', () => {
      cy.novoCliente().then((existente) => {
        cy.api('POST', '/verificar-email', { body: { email: existente.email } }).its('body.existe').should('eq', true);

        const outro = { ...novosDados(), email: existente.email };
        cy.api('POST', '/registrar', { body: outro }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.erro).to.match(/e-?mail já (cadastrado|está em uso)/i);
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Consulta de Perfil do Usuário Logado', () => {
    it('CORRETO: Consulta de perfil com token válido', () => {
      cy.novoCliente().then((cliente) => {
        cy.api('GET', '/me/perfil', { token: cliente.token }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.include({ nome: cliente.nome, email: cliente.email });
          expect(res.body, 'perfil de acesso').to.have.property('perfil', 'cliente');
        });
      });
    });

    it('INCORRETO: Consulta de perfil sem autenticação', () => {
      cy.api('GET', '/me/perfil').then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.erro).to.match(/token/i);
      });
      cy.api('GET', '/me/perfil', { token: 'token.invalido.ou-expirado' }).its('status').should('eq', 401);
    });
  });
});
