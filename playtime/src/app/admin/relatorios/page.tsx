'use client';

import { useEffect, useState } from 'react';
import { relatoriosApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminRelatoriosPage() {
  const [geral, setGeral] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await relatoriosApi.geral();
        setGeral(data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-12">Carregando relatórios...</div>;
  if (!geral) return <div className="text-center py-12 text-gray-500">Erro ao carregar relatórios.</div>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Relatórios</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resumo */}
        <div className="card p-4">
          <h4 className="font-semibold text-lg mb-2">Resumo</h4>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Clientes</span><span>{geral.total_clientes || 0}</span></div>
            <div className="flex justify-between"><span>Produtos</span><span>{geral.total_produtos || 0}</span></div>
            <div className="flex justify-between"><span>Vendas concluídas</span><span>{geral.total_vendas_concluidas || 0}</span></div>
            <div className="flex justify-between font-semibold">
              <span>Total arrecadado</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(geral.total_arrecadado || 0)}</span>
            </div>
          </div>
        </div>

        {/* Produtos mais vendidos */}
        <div className="card p-4">
          <h4 className="font-semibold text-lg mb-2">Produtos mais vendidos</h4>
          {geral.produtos_mais_vendidos && geral.produtos_mais_vendidos.length > 0 ? (
            <ul className="space-y-1">
              {geral.produtos_mais_vendidos.map((p: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{p.nome}</span>
                  <span>{p.total_vendido} und</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum dado.</p>
          )}
        </div>

        {/* Clientes top */}
        <div className="card p-4">
          <h4 className="font-semibold text-lg mb-2">Clientes top</h4>
          {geral.clientes_top && geral.clientes_top.length > 0 ? (
            <ul className="space-y-1">
              {geral.clientes_top.map((c: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{c.nome}</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.total_gasto)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum dado.</p>
          )}
        </div>
      </div>
    </div>
  );
}