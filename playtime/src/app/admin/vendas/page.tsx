'use client';

import { useEffect, useState } from 'react';
import { vendasApi } from '@/services/api';
import { Venda } from '@/types';
import { FaEye, FaCheck, FaBan } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminVendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await vendasApi.listar();
      setVendas(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const finalizar = async (id: number) => {
    try {
      await vendasApi.finalizar(id);
      toast.success('Venda finalizada.');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const cancelar = async (id: number) => {
    const motivo = prompt('Motivo do cancelamento:');
    if (motivo === null) return;
    try {
      await vendasApi.cancelar(id, motivo || 'Cancelado pelo gerente');
      toast.success('Venda cancelada.');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Vendas</h3>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : vendas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhuma venda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v.id_venda} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{v.id_venda}</td>
                    <td className="px-4 py-3">{v.nome_cliente || v.id_cliente}</td>
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
                      <button className="btn btn-primary btn-xs" onClick={() => {/* ver detalhes */}}>
                        <FaEye />
                      </button>
                      {v.status === 'pendente' && (
                        <>
                          <button className="btn btn-success btn-xs" onClick={() => finalizar(v.id_venda)}>
                            <FaCheck />
                          </button>
                          <button className="btn btn-danger btn-xs" onClick={() => cancelar(v.id_venda)}>
                            <FaBan />
                          </button>
                        </>
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