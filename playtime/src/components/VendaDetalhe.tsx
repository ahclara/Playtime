'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { vendasApi } from '@/services/api';
import { Venda } from '@/types';
import { formatBRL, formatDataHora, METODOS_PAGAMENTO, statusBadge } from '@/lib/format';
import Modal from './modal';
import Loader from './Loader';
import { ToyThumb } from './ToyArt';

interface Props {
  idVenda: number | null;
  onClose: () => void;
}

/** Modal com os itens de uma venda (busca em /vendas/:id). */
export default function VendaDetalhe({ idVenda, onClose }: Props) {
  const [venda, setVenda] = useState<Venda | null>(null);

  useEffect(() => {
    if (idVenda == null) return;
    setVenda(null);
    vendasApi
      .buscar(idVenda)
      .then(setVenda)
      .catch((err) => {
        toast.error(err.message);
        onClose();
      });
  }, [idVenda, onClose]);

  return (
    <Modal isOpen={idVenda != null} onClose={onClose} title={`Pedido #${idVenda ?? ''}`} wide>
      {!venda ? (
        <Loader label="Abrindo a nota..." dark />
      ) : (
        <div className="mono">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-3">
            <span>{formatDataHora(venda.data_venda)}</span>
            <span className={`badge ${statusBadge(venda.status)}`}>{venda.status}</span>
          </div>
          {venda.nome_cliente && <p className="text-sm mb-1">Cliente: {venda.nome_cliente}</p>}
          {venda.metodo_pagamento && <p className="text-sm mb-1">Pagamento: {METODOS_PAGAMENTO[venda.metodo_pagamento] || venda.metodo_pagamento}</p>}
          <div className="receipt-sep" />
          {venda.itens && venda.itens.length > 0 ? (
            <ul className="space-y-3">
              {venda.itens.map((item) => (
                <li key={item.id_item ?? item.id_produto} className="flex items-center gap-3">
                  <ToyThumb nome={item.nome_produto} id={item.id_produto} size={38} />
                  <span className="flex-1 font-sans">
                    <span className="font-semibold">{item.nome_produto || `Produto ${item.id_produto}`}</span>
                    <span className="block text-xs text-[#7d6b62]">
                      {item.quantidade} × {formatBRL(item.preco_unitario)}
                    </span>
                  </span>
                  <span className="tabular-nums">{formatBRL(item.subtotal ?? item.quantidade * item.preco_unitario)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#7d6b62]">Nenhum item registrado.</p>
          )}
          <div className="receipt-sep" />
          <div className="flex justify-between items-baseline">
            <span className="uppercase tracking-[0.15em]">Total</span>
            <span className="display text-3xl text-[var(--red)]">{formatBRL(venda.valor_total)}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
