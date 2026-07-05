'use client';

import { useEffect, useState } from 'react';
import { Venda } from '@/types';
import { vendasApi } from '@/services/api';
import toast from 'react-hot-toast';
import { FaEye } from 'react-icons/fa';

export default function ComprasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompras = async () => {
    try {
      const data = await vendasApi.minhasCompras();
      setVendas(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompras();
  }, []);

  const finalizar = async (id: number) => {
    try {
      await vendasApi.finalizar(id);
      toast.success('Venda finalizada!');
      loadCompras();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Minhas Compras</h2>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : vendas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhuma compra encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Data</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendas.map((v) => (
                  <tr key={v.id_venda} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{v.id_venda}</td>
                    <td className="px-4 py-3">{new Date(v.data_venda).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valor_total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${v.status === 'pago' ? 'badge-success' : v.status === 'pendente' ? 'badge-warning' : 'badge-danger'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="btn btn-primary btn-xs" onClick={() => { /* ver detalhes */ }}>
                        <FaEye />
                      </button>
                      {v.status === 'pendente' && (
                        <button className="btn btn-success btn-xs" onClick={() => finalizar(v.id_venda)}>
                          Finalizar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}