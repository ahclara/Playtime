'use client';

import { CarrinhoItem } from '@/types';
import { FaTrash } from 'react-icons/fa';

interface Props {
  item: CarrinhoItem;
  onRemove: (id: number) => void;
}

export default function ItemCarrinho({ item, onRemove }: Props) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div>
        <p className="font-medium">{item.nome}</p>
        <p className="text-sm text-gray-500">
          {item.quantidade} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco_unitario)}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco_unitario * item.quantidade)}
        </span>
        <button onClick={() => onRemove(item.id_produto)} className="text-danger hover:text-red-700 transition">
          <FaTrash />
        </button>
      </div>
    </div>
  );
}