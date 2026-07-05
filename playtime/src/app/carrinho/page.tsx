'use client';

import { useEffect, useState } from 'react';
import { CarrinhoItem } from '@/types';
import { FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CarrinhoPage() {
  const [itens, setItens] = useState<CarrinhoItem[]>([]);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('carrinho') || '[]');
    setItens(cart);
  };

  useEffect(() => {
    loadCart();
    const handleStorage = () => loadCart();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const remover = (id: number) => {
    let cart = JSON.parse(localStorage.getItem('carrinho') || '[]');
    const index = cart.findIndex((i: any) => i.id_produto === id);
    if (index === -1) return;
    if (cart[index].quantidade > 1) {
      cart[index].quantidade--;
    } else {
      cart.splice(index, 1);
    }
    localStorage.setItem('carrinho', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setItens(cart);
  };

  const limparCarrinho = () => {
    if (itens.length === 0) return;
    if (confirm('Limpar todo o carrinho?')) {
      localStorage.setItem('carrinho', '[]');
      window.dispatchEvent(new Event('storage'));
      setItens([]);
      toast.success('Carrinho limpo.');
    }
  };

  const total = itens.reduce((sum, item) => sum + item.preco_unitario * item.quantidade, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Carrinho</h2>
      <div className="card p-6">
        {itens.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Seu carrinho está vazio.</p>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {itens.map((item) => (
                <div key={item.id_produto} className="flex items-center justify-between py-3">
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
                    <button onClick={() => remover(item.id_produto)} className="text-danger hover:text-red-700 transition">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-xl font-bold">
                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
              <div className="flex gap-3">
                <button onClick={limparCarrinho} className="btn btn-outline">
                  Limpar
                </button>
                <Link href="/finalizar" className="btn btn-primary">
                  Finalizar Compra
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}