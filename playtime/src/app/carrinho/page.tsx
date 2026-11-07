'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTrash, FaPlus, FaMinus, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { CarrinhoItem } from '@/types';
import { changeQty, clearCart, getCart, removeItem } from '@/lib/cart';
import { formatBRL } from '@/lib/format';
import { ToyThumb } from '@/components/ToyArt';
import ToyBoxArt from '@/components/ToyBoxArt';
import Modal from '@/components/modal';

export default function CarrinhoPage() {
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);

  useEffect(() => {
    const load = () => setItens(getCart());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const total = itens.reduce((sum, item) => sum + item.preco_unitario * item.quantidade, 0);
  const unidades = itens.reduce((sum, item) => sum + item.quantidade, 0);

  const limpar = () => {
    clearCart();
    setItens([]);
    setConfirmarLimpar(false);
    toast.success('Carrinho limpo.');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow mb-2">Sua caixa de brinquedos</p>
          <h1 className="page-title">Carrinho</h1>
        </div>
        {itens.length > 0 && (
          <button onClick={() => setConfirmarLimpar(true)} className="btn btn-ghost btn-sm">
            <FaTrash /> Esvaziar
          </button>
        )}
      </div>

      {itens.length === 0 ? (
        <div className="paper empty">
          <ToyBoxArt className="w-48 mx-auto" />
          <p className="display">Sua caixa está vazia</p>
          <p className="mb-6">Nenhum brinquedo foi colocado aqui... ainda.</p>
          <Link href="/produtos" className="btn btn-primary">
            Ver brinquedos
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <ul className="paper divide-y-2 divide-dashed divide-[rgba(14,10,10,.18)]">
            {itens.map((item) => {
              const noLimite = item.estoque > 0 && item.quantidade >= item.estoque;
              return (
                <li key={item.id_produto} className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 sm:p-5">
                  <ToyThumb nome={item.nome} id={item.id_produto} size={64} />
                  <div className="flex-1 min-w-[140px]">
                    <p className="display text-xl leading-tight">{item.nome}</p>
                    <p className="mono text-xs tracking-[0.1em] text-[#7d6b62] mt-1">{formatBRL(item.preco_unitario)} / unidade</p>
                  </div>

                  <div className="flex items-center border-[3px] border-[var(--ink)] rounded-xl overflow-hidden bg-[#fffaf0]" aria-label="Quantidade">
                    <button
                      className="w-10 h-10 grid place-items-center hover:bg-[var(--hazard)] transition-colors"
                      onClick={() => setItens(changeQty(item.id_produto, -1))}
                      aria-label="Diminuir"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="w-10 text-center font-bold tabular-nums">{item.quantidade}</span>
                    <button
                      className="w-10 h-10 grid place-items-center hover:bg-[var(--hazard)] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      onClick={() => setItens(changeQty(item.id_produto, 1))}
                      disabled={noLimite}
                      aria-label="Aumentar"
                      title={noLimite ? 'Limite do estoque' : undefined}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  <p className="display text-xl w-28 text-right tabular-nums">{formatBRL(item.preco_unitario * item.quantidade)}</p>

                  <button
                    onClick={() => setItens(removeItem(item.id_produto))}
                    className="btn btn-danger btn-xs"
                    aria-label={`Remover ${item.nome}`}
                    title="Remover"
                  >
                    <FaTrash />
                  </button>
                </li>
              );
            })}
          </ul>

          <aside className="receipt p-6 lg:sticky lg:top-32">
            <p className="text-center tracking-[0.25em] uppercase text-sm">Playtime</p>
            <p className="text-center text-xs tracking-[0.15em] uppercase text-[#7d6b62]">Resumo do pedido</p>
            <div className="receipt-sep" />
            {itens.map((i) => (
              <div key={i.id_produto} className="receipt-line text-sm">
                <span className="truncate">
                  {i.quantidade}× {i.nome}
                </span>
                <span className="tabular-nums">{formatBRL(i.preco_unitario * i.quantidade)}</span>
              </div>
            ))}
            <div className="receipt-sep" />
            <div className="receipt-line text-sm">
              <span>Itens</span>
              <span>{unidades}</span>
            </div>
            <div className="receipt-line items-baseline">
              <span className="uppercase tracking-[0.15em]">Total</span>
              <span className="display text-3xl text-[var(--red)]">{formatBRL(total)}</span>
            </div>
            <Link href="/finalizar" className="btn btn-primary btn-block mt-5 text-lg">
              Finalizar compra <FaArrowRight />
            </Link>
            <Link href="/produtos" className="block text-center text-sm mt-4 underline underline-offset-4 hover:text-[var(--red)]">
              Continuar comprando
            </Link>
          </aside>
        </div>
      )}

      <Modal isOpen={confirmarLimpar} onClose={() => setConfirmarLimpar(false)} title="Esvaziar carrinho" onConfirm={limpar} confirmText="Esvaziar" danger>
        <p>Todos os brinquedos serão retirados da sua caixa. Continuar?</p>
      </Modal>
    </div>
  );
}
