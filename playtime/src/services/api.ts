import { AuthResponse, Produto, Cliente, Venda, Cancelamento } from '@/types';

const API_BASE = '/api';

export const api = {
  token: null as string | null,

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('playtime_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('playtime_token');
    }
    return null;
  },

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('playtime_token');
    }
  },

  get headers() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async request<T>(method: string, path: string, data?: any): Promise<T> {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      method,
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(json.erro || json.mensagem || `Erro ${res.status}`);
      (error as any).status = res.status;
      throw error;
    }

    return json as T;
  },

  get<T>(path: string) {
    return this.request<T>('GET', path);
  },

  post<T>(path: string, data?: any) {
    return this.request<T>('POST', path, data);
  },

  put<T>(path: string, data?: any) {
    return this.request<T>('PUT', path, data);
  },

  patch<T>(path: string, data?: any) {
    return this.request<T>('PATCH', path, data);
  },

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  },
};

// --- Auth ---
export const authApi = {
  login(email: string, senha: string) {
    return api.post<AuthResponse>('/login', { email, senha });
  },

  register(dados: { nome: string; cpf: string; email: string; senha: string; perfil?: string }) {
    return api.post<{ mensagem: string }>('/registrar', dados);
  },
};

// --- Produtos ---
export const produtosApi = {
  listar(filtro?: string) {
    const url = filtro ? `/produtos?filtro=${encodeURIComponent(filtro)}` : '/produtos';
    return api.get<Produto[]>(url);
  },

  buscar(id: number) {
    return api.get<Produto>(`/produtos/${id}`);
  },

  criar(produto: Omit<Produto, 'id_produto' | 'data_cadastro'>) {
    return api.post<Produto>('/produtos', produto);
  },

  atualizar(id: number, dados: Partial<Produto>) {
    return api.put<Produto>(`/produtos/${id}`, dados);
  },

  atualizarEstoque(id: number, quantidade: number) {
    return api.patch<{ estoque_atual: number }>(`/produtos/${id}/estoque`, { quantidade });
  },

  deletar(id: number) {
    return api.delete<{ mensagem: string }>(`/produtos/${id}`);
  },
};

// --- Clientes ---
export const clientesApi = {
  listar() {
    return api.get<Cliente[]>('/clientes');
  },

  buscar(id: number) {
    return api.get<Cliente>(`/clientes/${id}`);
  },

  criar(cliente: Omit<Cliente, 'id_cliente' | 'data_cadastro'>) {
    return api.post<Cliente>('/clientes', cliente);
  },

  atualizar(id: number, dados: Partial<Cliente>) {
    return api.put<Cliente>(`/clientes/${id}`, dados);
  },

  deletar(id: number) {
    return api.delete<{ mensagem: string }>(`/clientes/${id}`);
  },
};

// --- Vendas ---
export const vendasApi = {
  listar() {
    return api.get<Venda[]>('/vendas');
  },

  buscar(id: number) {
    return api.get<Venda>(`/vendas/${id}`);
  },

  criarPendente(dados: { id_cliente: number; itens: { id_produto: number; quantidade: number }[]; metodo_pagamento?: string }) {
    return api.post<{ id_venda: number; status: string; valor_total: number }>('/vendas/pendente', dados);
  },

  comprar(itens: { id_produto: number; quantidade: number }[], metodo_pagamento?: string) {
    return api.post<{ id_venda: number; status: string; valor_total: number }>('/vendas/comprar', { itens, metodo_pagamento });
  },

  finalizar(id: number) {
    return api.post<{ mensagem: string; status: string; valor_total: number }>(`/vendas/${id}/finalizar`);
  },

  cancelar(id: number, motivo?: string) {
    return api.post<{ mensagem: string }>(`/vendas/${id}/cancelar`, { motivo });
  },

  minhasCompras() {
    return api.get<Venda[]>('/compras/cliente');
  },
};

// --- Cancelamentos ---
export const cancelamentosApi = {
  listar() {
    return api.get<Cancelamento[]>('/cancelamentos');
  },
};

// --- Relatórios ---
export const relatoriosApi = {
  geral() {
    return api.get<any>('/relatorios/geral');
  },

  vendasPeriodo(data_inicio: string, data_fim: string) {
    return api.get<any>(`/relatorios/vendas-periodo?data_inicio=${data_inicio}&data_fim=${data_fim}`);
  },

  produtosMaisVendidos(data_inicio: string, data_fim: string) {
    return api.get<any>(`/relatorios/produtos-mais-vendidos?data_inicio=${data_inicio}&data_fim=${data_fim}`);
  },
};