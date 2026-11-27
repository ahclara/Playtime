/// <reference types="cypress" />
import { CHAVE_TOKEN, gerarJwt, Perfil, USUARIOS } from '../../support/dados';

/**
 * 1. Autenticação e Cadastro — testes de INTERFACE
 * O back-end é simulado com cy.intercept, com as mesmas respostas da API Flask.
 */
describe('1. Autenticação e Cadastro (interface)', () => {
  beforeEach(() => {
    cy.bloquearApiNaoMockada();
    cy.intercept('GET', '**/api/produtos*', { fixture: 'produtos.json' }).as('produtos');
  });

  const preencherLogin = (email: string, senha: string) => {
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(senha, { log: false });
    cy.contains('button', 'Entrar').click();
  };

  // -------------------------------------------------------------------------
  describe('Login do Usuário', () => {
    const navPorPerfil: Record<Perfil, { label: string; menu?: string }> = {
      cliente: { label: 'Cliente' },
      vendedor: { label: 'Vendedor', menu: 'Balcão' },
      gerente: { label: 'Gerente', menu: 'Gerência' },
    };

    (Object.keys(navPorPerfil) as Perfil[]).forEach((perfil) => {
      it(`CORRETO: Login realizado com sucesso (${perfil})`, () => {
        const usuario = USUARIOS[perfil];
        const token = gerarJwt(usuario);
        cy.intercept('POST', '**/api/login', { statusCode: 200, body: { token, usuario } }).as('login');

        cy.visit('/');
        preencherLogin(usuario.email, 'senha123');

        cy.wait('@login').its('request.body').should('deep.equal', { email: usuario.email, senha: 'senha123' });
        // a mensagem some em 2 s, então é conferida antes da troca de página
        cy.contains('Login realizado com sucesso!').should('exist');
        // token JWT gerado e guardado
        cy.window().its('localStorage').invoke('getItem', CHAVE_TOKEN).should('eq', token);
        // redireciona para o menu principal conforme o perfil
        cy.location('pathname', { timeout: 30000 }).should('eq', '/produtos');
        cy.get('header').should('contain.text', usuario.nome).and('contain.text', navPorPerfil[perfil].label);
        if (navPorPerfil[perfil].menu) {
          cy.get('nav[aria-label="Principal"]').contains('a', navPorPerfil[perfil].menu!).should('be.visible');
        } else {
          cy.get('nav[aria-label="Principal"]').should('not.contain.text', 'Gerência').and('not.contain.text', 'Balcão');
        }
      });
    });

    it('INCORRETO: Login com senha incorreta', () => {
      cy.intercept('POST', '**/api/login', { statusCode: 401, body: { erro: 'Email ou senha inválidos' } }).as('login');

      cy.visit('/');
      preencherLogin(USUARIOS.cliente.email, 'senhaErrada');

      cy.wait('@login').its('response.statusCode').should('eq', 401);
      cy.get('[role="alert"]')
        .should('exist')
        .invoke('text')
        .should('match', /credenciais inválidas|e-?mail ou senha inválidos/i);
      cy.location('pathname').should('eq', '/');
      cy.window().its('localStorage').invoke('getItem', CHAVE_TOKEN).should('be.null');
    });
  });

  // -------------------------------------------------------------------------
  describe('Cadastro de Cliente', () => {
    const dados = { nome: 'Carla Visitante', cpf: '12345678901', email: 'carla@teste.com', senha: 'senha123' };

    const preencherCadastro = (d: Partial<typeof dados>) => {
      if (d.nome) cy.campo('Nome completo').type(d.nome);
      if (d.cpf) cy.campo('CPF').type(d.cpf);
      if (d.email) cy.campo('E-mail').type(d.email);
      if (d.senha) cy.campo('Senha').type(d.senha, { log: false });
      cy.contains('button', 'Cadastrar').click();
    };

    it('CORRETO: Cadastro de cliente com dados válidos', () => {
      cy.intercept('POST', '**/api/registrar', {
        statusCode: 201,
        body: {
          mensagem: 'Usuário registrado com sucesso!',
          cliente: { id_cliente: 20, nome: dados.nome, cpf: dados.cpf, email: dados.email },
          usuario: { id_usuario: 30, email: dados.email, perfil: 'cliente', nome: dados.nome },
        },
      }).as('registrar');

      cy.visit('/cadastro');
      preencherCadastro(dados);

      cy.wait('@registrar').then(({ request, response }) => {
        expect(request.body).to.deep.equal(dados);
        expect(response!.body.usuario.perfil).to.eq('cliente');
      });
      cy.contains('Cadastro realizado! Faça login.').should('be.visible');
      // volta para o login, liberado para entrar
      cy.location('pathname').should('eq', '/');
      cy.contains('button', 'Entrar').should('be.visible');
    });

    (['nome', 'cpf', 'email', 'senha'] as const).forEach((campoVazio) => {
      it(`INCORRETO: Cadastro com campo obrigatório vazio (${campoVazio})`, () => {
        cy.intercept('POST', '**/api/registrar').as('registrar');

        cy.visit('/cadastro');
        preencherCadastro({ ...dados, [campoVazio]: '' });

        cy.get('[role="alert"]').should('be.visible').and('contain.text', 'campos obrigatórios');
        cy.location('pathname').should('eq', '/cadastro');
        cy.get('@registrar.all').should('have.length', 0); // conta não foi criada
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('Verificação de E-mail já cadastrado', () => {
    it('CORRETO: E-mail inédito — cadastro criado e login permitido', () => {
      const novo = { nome: 'Davi Novo', cpf: '98765432100', email: 'davi.novo@teste.com', senha: 'senha123' };
      const usuario = { id_usuario: 31, id_cliente: 21, email: novo.email, perfil: 'cliente' as const, nome: novo.nome };
      cy.intercept('POST', '**/api/registrar', { statusCode: 201, body: { mensagem: 'Usuário registrado com sucesso!', usuario } }).as('registrar');
      cy.intercept('POST', '**/api/login', { statusCode: 200, body: { token: gerarJwt(usuario), usuario } }).as('login');

      cy.visit('/cadastro');
      cy.campo('Nome completo').type(novo.nome);
      cy.campo('CPF').type(novo.cpf);
      cy.campo('E-mail').type(novo.email);
      cy.campo('Senha').type(novo.senha);
      cy.contains('button', 'Cadastrar').click();
      cy.wait('@registrar').its('response.statusCode').should('eq', 201);

      cy.location('pathname').should('eq', '/');
      preencherLogin(novo.email, novo.senha);
      cy.wait('@login');
      cy.location('pathname').should('eq', '/produtos');
      cy.get('header').should('contain.text', novo.nome);
    });

    it('INCORRETO: Tentativa de cadastro com e-mail duplicado', () => {
      cy.intercept('POST', '**/api/registrar', { statusCode: 400, body: { erro: 'Email já cadastrado' } }).as('registrar');

      cy.visit('/cadastro');
      cy.campo('Nome completo').type('Ana Repetida');
      cy.campo('CPF').type('00011122233');
      cy.campo('E-mail').type(USUARIOS.cliente.email);
      cy.campo('Senha').type('senha123');
      cy.contains('button', 'Cadastrar').click();

      cy.wait('@registrar');
      cy.get('[role="alert"]').should('be.visible').invoke('text').should('match', /e-?mail já (cadastrado|está em uso)/i);
      cy.location('pathname').should('eq', '/cadastro');
    });
  });

  // -------------------------------------------------------------------------
  describe('Consulta de Perfil do Usuário Logado', () => {
    it('CORRETO: Consulta de perfil com token válido', () => {
      cy.visitComo('cliente', '/produtos');
      cy.wait('@produtos').its('request.headers.authorization').should('match', /^Bearer .+\..+\..+/);

      cy.location('pathname').should('eq', '/produtos');
      cy.get('header').should('contain.text', USUARIOS.cliente.nome).and('contain.text', 'Cliente');
      cy.contains(`Olá, ${USUARIOS.cliente.nome.split(' ')[0]}`).should('be.visible');
    });

    it('INCORRETO: Acesso sem autenticação', () => {
      cy.visit('/produtos');
      cy.location('pathname').should('eq', '/');
      cy.contains('button', 'Entrar').should('be.visible');
      cy.get('@produtos.all').should('have.length', 0);
    });

    it('INCORRETO: Token expirado', () => {
      cy.visitComo('cliente', '/produtos', { expiraEm: -60 });
      cy.location('pathname').should('eq', '/');
      cy.window().its('localStorage').invoke('getItem', CHAVE_TOKEN).should('be.null');
    });

    it('INCORRETO: API responde 401 durante a sessão — volta para o login', () => {
      cy.intercept('GET', '**/api/produtos*', { statusCode: 401, body: { erro: 'Token expirado. Faça login novamente' } }).as('produtos401');
      cy.visitComo('cliente', '/produtos');
      cy.wait('@produtos401');
      cy.location('pathname').should('eq', '/');
      cy.window().its('localStorage').invoke('getItem', CHAVE_TOKEN).should('be.null');
    });
  });
});
