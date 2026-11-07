'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaCreditCard, FaRegCreditCard, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { FaPix } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { CarrinhoItem } from '@/types';
import { vendasApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { clearCart, getCart } from '@/lib/cart';
import { formatBRL } from '@/lib/format';

const METODOS = [
  { id: 'pix', label: 'PIX', desc: 'Aprovação na hora', Icon: FaPix, cor: 'var(--teal)' },
  { id: 'cartao_credito', label: 'Crédito', desc: 'Cartão de crédito', Icon: FaCreditCard, cor: 'var(--hazard)' },
  { id: 'cartao_debito', label: 'Débito', desc: 'Cartão de débito', Icon: FaRegCreditCard, cor: '#8b5cf6' },
  { id: 'dinheiro', label: 'Dinheiro', desc: 'Pagamento no balcão', Icon: FaMoneyBillWave, cor: '#3fbf5f' },
];

export default function FinalizarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      router.push('/carrinho');
    }
    setItens(cart);
  }, [router]);

  const total = itens.reduce((sum, item) => sum + item.preco_unitario * item.quantidade, 0);

  const handleFinalizar = async () => {
    if (itens.length === 0) {
      toast.error('Carrinho vazio.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        itens: itens.map((i) => ({ id_produto: i.id_produto, quantidade: i.quantidade })),
        metodo_pagamento: metodoPagamento,
      };

      let response;
      if (user?.perfil === 'cliente') {
        response = await vendasApi.comprar(payload.itens, payload.metodo_pagamento);
      } else {
        // Vendedor/gerente: usa o cliente vinculado ao usuário logado
        const id_cliente = user?.id_cliente;
        if (!id_cliente) {
          toast.error('Cliente não identificado.');
          return;
        }
        response = await vendasApi.criarPendente({
          id_cliente,
          itens: payload.itens,
          metodo_pagamento: payload.metodo_pagamento,
        });
      }

      if (response && response.id_venda) {
        await vendasApi.finalizar(response.id_venda);
        toast.success('Compra finalizada com sucesso!');
        clearCart();
        router.push('/compras');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow mb-2">Último passo</p>
          <h1 className="page-title">Finalizar compra</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <section className="paper p-6">
          <h2 className="display text-2xl mb-1">Como você vai pagar?</h2>
          <p className="text-sm text-[#5b4d46] mb-5">Escolha uma forma de pagamento.</p>

          <div className="grid sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Método de pagamento">
            {METODOS.map(({ id, label, desc, Icon, cor }) => {
              const sel = metodoPagamento === id;
              return (
                <label
                  key={id}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-[3px] border-[var(--ink)] cursor-pointer transition-all ${
                    sel ? 'bg-[#fffaf0] shadow-[5px_5px_0_var(--ink)] -translate-x-0.5 -translate-y-0.5' : 'bg-[var(--paper-2)] hover:bg-[#fffaf0]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={id}
                    checked={sel}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                    className="sr-only"
                  />
                  <span className="w-12 h-12 grid place-items-center rounded-lg border-[3px] border-[var(--ink)] text-xl" style={{ background: cor }}>
                    <Icon />
                  </span>
                  <span>
                    <span className="display text-xl block leading-none">{label}</span>
                    <span className="text-sm text-[#5b4d46]">{desc}</span>
                  </span>
                  {sel && (
                    <span className="absolute -top-3 -right-3 w-8 h-8 grid place-items-center rounded-full bg-[var(--red)] text-[var(--paper)] border-[3px] border-[var(--ink)]">
                      <FaCheck size={12} />
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <button onClick={() => router.push('/carrinho')} className="btn btn-outline btn-sm mt-8">
            <FaArrowLeft /> Voltar ao carrinho
          </button>
        </section>

        <aside className="receipt p-6 lg:sticky lg:top-32">
          <p className="text-center tracking-[0.25em] uppercase text-sm">Playtime</p>
          <p className="text-center text-xs tracking-[0.15em] uppercase text-[#7d6b62]">Nota do pedido</p>
          <div className="receipt-sep" />
          {itens.map((item) => (
            <div key={item.id_produto} className="receipt-line text-sm">
              <span className="truncate">
                {item.quantidade}× {item.nome}
              </span>
              <span className="tabular-nums">{formatBRL(item.preco_unitario * item.quantidade)}</span>
            </div>
          ))}
          <div className="receipt-sep" />
          <div className="receipt-line text-sm">
            <span>Pagamento</span>
            <span>{METODOS.find((m) => m.id === metodoPagamento)?.label}</span>
          </div>
          <div className="receipt-line items-baseline">
            <span className="uppercase tracking-[0.15em]">Total</span>
            <span className="display text-3xl text-[var(--red)]">{formatBRL(total)}</span>
          </div>
          <button onClick={handleFinalizar} disabled={loading || itens.length === 0} className="btn btn-primary btn-block mt-5 text-lg">
            {loading ? 'Processando...' : 'Confirmar compra'}
          </button>
        </aside>
      </div>
    </div>
  );
}
