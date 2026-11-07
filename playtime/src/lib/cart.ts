import { CarrinhoItem, Produto } from '@/types';

const KEY = 'carrinho';

export function getCart(): CarrinhoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(itens: CarrinhoItem[]) {
  localStorage.setItem(KEY, JSON.stringify(itens));
  // avisa o Header e as outras telas na mesma aba
  window.dispatchEvent(new Event('storage'));
}

export function clearCart() {
  saveCart([]);
}

/** Adiciona 1 unidade. Retorna mensagem de erro, ou null se deu certo. */
export function addToCart(produto: Produto): string | null {
  if (produto.estoque <= 0) return 'Produto sem estoque.';
  const cart = getCart();
  const existing = cart.find((i) => i.id_produto === produto.id_produto);
  if (existing) {
    if (existing.quantidade >= produto.estoque) return 'Quantidade máxima atingida.';
    existing.quantidade++;
  } else {
    cart.push({
      id_produto: produto.id_produto,
      nome: produto.nome,
      preco_unitario: produto.preco_unitario,
      quantidade: 1,
      estoque: produto.estoque,
    });
  }
  saveCart(cart);
  return null;
}

/** Soma `delta` à quantidade (remove o item se chegar a zero). */
export function changeQty(id: number, delta: number): CarrinhoItem[] {
  const cart = getCart();
  const item = cart.find((i) => i.id_produto === id);
  if (!item) return cart;
  const nova = Math.min(item.quantidade + delta, item.estoque || Infinity);
  const next = nova <= 0 ? cart.filter((i) => i.id_produto !== id) : cart.map((i) => (i.id_produto === id ? { ...i, quantidade: nova } : i));
  saveCart(next);
  return next;
}

export function removeItem(id: number): CarrinhoItem[] {
  const next = getCart().filter((i) => i.id_produto !== id);
  saveCart(next);
  return next;
}
