'use client';

import { Produto } from '@/types';
import { FaCartPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  produto: Produto;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export default function ProdutoCard({ produto, onDelete, onEdit }: Props) {
  const { user } = useAuth();

  const adicionarAoCarrinho = () => {
    if (produto.estoque <= 0) {
      toast.error('Produto sem estoque.');
      return;
    }
    // Obter carrinho do localStorage
    const cart = JSON.parse(localStorage.getItem('carrinho') || '[]');
    const existing = cart.find((item: any) => item.id_produto === produto.id_produto);
    if (existing) {
      if (existing.quantidade >= produto.estoque) {
        toast.error('Quantidade máxima atingida.');
        return;
      }
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
    localStorage.setItem('carrinho', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    toast.success(`${produto.nome} adicionado ao carrinho.`);
  };

  return (
    <div className="card p-4 flex flex-col">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{produto.nome}</h3>
        <p className="text-sm text-gray-500">{produto.categoria || 'Sem categoria'}</p>
        <p className="text-2xl font-bold mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco_unitario)}</p>
        <p className="text-sm text-gray-500">Estoque: {produto.estoque}</p>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={adicionarAoCarrinho} className="btn btn-primary text-sm flex-1 flex items-center justify-center gap-1">
          <FaCartPlus /> Comprar
        </button>
        {user?.perfil === 'gerente' && (
          <>
            <button onClick={() => onEdit?.(produto.id_produto)} className="btn btn-outline btn-sm px-3">
              <FaEdit />
            </button>
            <button onClick={() => onDelete?.(produto.id_produto)} className="btn btn-danger btn-sm px-3">
              <FaTrash />
            </button>
          </>
        )}
      </div>
    </div>
  );
}