const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatBRL = (valor: number | string | null | undefined) => brl.format(Number(valor) || 0);

export const formatData = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—');

export const formatDataHora = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export const METODOS_PAGAMENTO: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
  pix: 'PIX',
};

export const statusBadge = (status: string) =>
  status === 'pago' ? 'badge-success' : status === 'pendente' ? 'badge-warning' : 'badge-danger';
