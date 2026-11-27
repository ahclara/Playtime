/**
 * Dados e utilitários compartilhados pelos testes.
 */

export type Perfil = 'cliente' | 'vendedor' | 'gerente';

export interface UsuarioTeste {
  id_usuario: number;
  id_cliente: number | null;
  email: string;
  perfil: Perfil;
  nome: string;
}

/** Usuários "falsos" usados nos testes de interface (o back-end é simulado com cy.intercept). */
export const USUARIOS: Record<Perfil, UsuarioTeste> = {
  cliente: { id_usuario: 3, id_cliente: 3, email: 'Ana@gmail.com', perfil: 'cliente', nome: 'Ana Clara' },
  vendedor: { id_usuario: 17, id_cliente: null, email: 'vendedor@gmail.com', perfil: 'vendedor', nome: 'Vendedor' },
  gerente: { id_usuario: 11, id_cliente: null, email: 'admin@playtime.com', perfil: 'gerente', nome: 'Administrador' },
};

const base64url = (obj: object) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

/**
 * Gera um JWT com o mesmo payload que o back-end gera.
 * O front só decodifica o payload (não valida a assinatura), então isso basta
 * para simular um usuário logado nos testes de interface.
 */
export function gerarJwt(usuario: UsuarioTeste, expiraEmSegundos = 3600): string {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const payload = base64url({ ...usuario, exp: Math.floor(Date.now() / 1000) + expiraEmSegundos });
  return `${header}.${payload}.assinatura-de-teste`;
}

/** Regex para valores em reais formatados pelo front (aceita o espaço não separável do Intl). */
export function brl(valor: number): RegExp {
  const txt = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return new RegExp(`R\\$\\s?${txt.replace(/\./g, '\\.')}`);
}

/** Sufixo único para e-mails/CPFs criados nos testes de API. */
export function unico(): string {
  return `${Date.now()}`.slice(-8) + `${Math.floor(Math.random() * 900) + 100}`; // 11 dígitos
}

export const CHAVE_TOKEN = 'playtime_token';
export const CHAVE_CARRINHO = 'carrinho';
