import { CHAVE_CARRINHO, CHAVE_TOKEN, gerarJwt, Perfil, unico, USUARIOS, UsuarioTeste } from './dados';

// ---------------------------------------------------------------------------
// Tipos dos comandos customizados
// ---------------------------------------------------------------------------

export interface ItemCarrinho {
  id_produto: number;
  nome: string;
  preco_unitario: number;
  quantidade: number;
  estoque: number;
}

export interface VisitComoOpcoes {
  usuario?: Partial<UsuarioTeste>;
  carrinho?: ItemCarrinho[];
  /** Validade do token em segundos (negativo = token expirado). */
  expiraEm?: number;
}

export interface ClienteCriado {
  id_cliente: number;
  id_usuario: number;
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  token: string;
}

export interface ProdutoApi {
  id_produto: number;
  nome: string;
  preco_unitario: number;
  estoque: number;
  categoria?: string;
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Bloqueia qualquer chamada /api não simulada (os testes de interface não dependem do back-end). */
      bloquearApiNaoMockada(): Chainable<null>;
      /** Abre uma página já autenticado com o perfil informado (token JWT no localStorage). */
      visitComo(perfil: Perfil, caminho: string, opcoes?: VisitComoOpcoes): Chainable<Cypress.AUTWindow>;
      /** Campo de formulário pelo texto do rótulo (label.field). */
      campo(rotulo: string | RegExp): Chainable<JQuery<HTMLElement>>;
      /**
       * Define o valor de um input controlado pelo React de uma vez (como colar o valor).
       * Usado nos campos numéricos, onde digitar caractere por caractere passa por estados inválidos (ex.: "-").
       */
      definirValor(valor: string | number): Chainable<JQuery<HTMLElement>>;

      /** Requisição para a API real do back-end (não falha em status 4xx/5xx). */
      api<T = any>(metodo: Metodo, caminho: string, opcoes?: { token?: string; body?: any }): Chainable<Cypress.Response<T>>;
      /** E-mail e senha do usuário de teste (gerente/vendedor), vindos de cy.env. */
      credenciaisDe(perfil: 'gerente' | 'vendedor'): Chainable<{ email: string; senha: string }>;
      /** Faz login na API com o usuário de teste (gerente/vendedor) e devolve o token. */
      tokenDe(perfil: 'gerente' | 'vendedor'): Chainable<string>;
      /** Cadastra um cliente novo via /api/registrar, faz login e devolve os dados + token. */
      novoCliente(): Chainable<ClienteCriado>;
      /** Cadastra um produto novo via API (precisa do token do gerente). */
      novoProduto(tokenGerente: string, dados?: Partial<ProdutoApi>): Chainable<ProdutoApi>;
    }
  }
}

// ---------------------------------------------------------------------------
// Comandos para os testes de INTERFACE
// ---------------------------------------------------------------------------

Cypress.Commands.add('bloquearApiNaoMockada', () => {
  cy.intercept({ url: '**/api/**' }, (req) => {
    req.reply({ statusCode: 500, body: { erro: `Rota não simulada no teste: ${req.method} ${req.url}` } });
  });
});

Cypress.Commands.add('visitComo', (perfil: Perfil, caminho: string, opcoes: VisitComoOpcoes = {}) => {
  const usuario = { ...USUARIOS[perfil], ...opcoes.usuario } as UsuarioTeste;
  const token = gerarJwt(usuario, opcoes.expiraEm ?? 3600);
  return cy.visit(caminho, {
    onBeforeLoad(win) {
      win.localStorage.setItem(CHAVE_TOKEN, token);
      if (opcoes.carrinho) win.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(opcoes.carrinho));
    },
  });
});

Cypress.Commands.add('campo', (rotulo: string | RegExp) => {
  return cy.contains('label.field', rotulo).find('input, textarea, select').first();
});

Cypress.Commands.add('definirValor', { prevSubject: 'element' }, (subject: JQuery<HTMLElement>, valor: string | number) => {
  const el = subject[0] as HTMLInputElement | HTMLTextAreaElement;
  const win = el.ownerDocument.defaultView as Window & typeof globalThis;
  const proto = el.tagName === 'TEXTAREA' ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, String(valor));
  el.dispatchEvent(new win.Event('input', { bubbles: true }));
  return cy.wrap(subject);
});

// ---------------------------------------------------------------------------
// Comandos para os testes de API (back-end real)
// ---------------------------------------------------------------------------

Cypress.Commands.add('api', (metodo: Metodo, caminho: string, opcoes: { token?: string; body?: any } = {}) => {
  return cy.request({
    method: metodo,
    url: `${Cypress.expose('apiUrl')}${caminho}`,
    body: opcoes.body,
    headers: opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {},
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('credenciaisDe', (perfil: 'gerente' | 'vendedor') => {
  return cy.env([`${perfil}Email`, `${perfil}Senha`]).then((env) => ({
    email: env[`${perfil}Email`] as string,
    senha: env[`${perfil}Senha`] as string,
  }));
});

Cypress.Commands.add('tokenDe', (perfil: 'gerente' | 'vendedor') => {
  return cy.credenciaisDe(perfil).then(({ email, senha }) =>
    cy.api('POST', '/login', { body: { email, senha } }).then((res) => {
      expect(res.status, `login do ${perfil} de teste (rode back-end/scripts/seed_cypress.py)`).to.eq(200);
      return res.body.token as string;
    }),
  );
});

Cypress.Commands.add('novoCliente', () => {
  const id = unico();
  const dados = { nome: `Cliente Cypress ${id}`, cpf: id, email: `cy.${id}@teste.com`, senha: 'senha123' };
  return cy.api('POST', '/registrar', { body: dados }).then((reg) => {
    expect(reg.status, 'cadastro do cliente de teste').to.eq(201);
    return cy.api('POST', '/login', { body: { email: dados.email, senha: dados.senha } }).then((login) => {
      expect(login.status).to.eq(200);
      return {
        ...dados,
        id_cliente: reg.body.cliente.id_cliente,
        id_usuario: reg.body.usuario.id_usuario,
        token: login.body.token,
      } as ClienteCriado;
    });
  });
});

Cypress.Commands.add('novoProduto', (tokenGerente: string, dados: Partial<ProdutoApi> = {}) => {
  const body = {
    nome: `Brinquedo Cypress ${unico()}`,
    descricao: 'Criado pelos testes automatizados',
    preco_unitario: 50,
    estoque: 10,
    categoria: 'Testes',
    ...dados,
  };
  return cy.api('POST', '/produtos', { token: tokenGerente, body }).then((res) => {
    expect(res.status, 'cadastro do produto de teste').to.eq(201);
    return res.body as ProdutoApi;
  });
});
