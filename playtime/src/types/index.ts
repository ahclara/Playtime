export interface Produto {
  id_produto: number;
  nome: string;
  descricao?: string;
  preco_unitario: number;
  estoque: number;
  categoria?: string;
  data_cadastro?: string;
}

export interface Cliente {
  id_cliente: number;
  nome: string;
  cpf: string;
  email: string;
  ativo?: boolean;
  data_cadastro?: string;
}

export interface Venda {
  id_venda: number;
  id_cliente: number;
  nome_cliente?: string;
  data_venda: string;
  valor_total: number;
  status: 'pendente' | 'pago' | 'cancelado';
  metodo_pagamento?: string;
  itens?: ItemVenda[];
}

export interface ItemVenda {
  id_item: number;
  id_produto: number;
  nome_produto?: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Cancelamento {
  id_cancelamento: number;
  id_venda: number;
  id_cliente: number;
  motivo: string;
  data_cancelamento: string;
}

export interface Usuario {
  id_usuario: number;
  id_cliente: number | null;
  email: string;
  perfil: 'cliente' | 'vendedor' | 'gerente';
  nome: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface CarrinhoItem {
  id_produto: number;
  nome: string;
  preco_unitario: number;
  quantidade: number;
  estoque: number;
}