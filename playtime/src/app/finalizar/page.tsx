'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CarrinhoItem } from '@/types';
import { vendasApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function FinalizarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('carrinho') || '[]');
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
        itens: itens.map(i => ({ id_produto: i.id_produto, quantidade: i.quantidade })),
        metodo_pagamento: metodoPagamento,
      };

      let response;
      if (user?.perfil === 'cliente') {
        response = await vendasApi.comprar(payload.itens, payload.metodo_pagamento);
      } else {
        // Vendedor/gerente: usar o próprio cliente logado (ou poderia selecionar um cliente)
        // Aqui usamos o id_cliente do usuário logado
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
        // Finalizar a venda
        await vendasApi.finalizar(response.id_venda);
        toast.success('Compra finalizada com sucesso!');
        localStorage.removeItem('carrinho');
        window.dispatchEvent(new Event('storage'));
        router.push('/compras');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Finalizar Compra</h2>
      <div className="card p-6">
        <div className="space-y-2 mb-6">
          {itens.map((item) => (
            <div key={item.id_produto} className="flex justify-between py-1 border-b border-gray-100">
              <span>{item.quantidade}x {item.nome}</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco_unitario * item.quantidade)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg pt-2">
            <span>Total</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pagamento</label>
          <div className="flex flex-wrap gap-4">
            {['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'].map((met) => (
              <label key={met} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment"
                  value={met}
                  checked={metodoPagamento === met}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                  className="accent-primary"
                />
                <span className="capitalize">{met.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => router.push('/carrinho')} className="btn btn-outline">
            Voltar
          </button>
          <button onClick={handleFinalizar} disabled={loading} className="btn btn-primary">
            {loading ? 'Processando...' : 'Confirmar Compra'}
          </button>
        </div>
      </div>
    </div>
  );
}