'use client';

import { useEffect, useState } from 'react';
import { cancelamentosApi } from '@/services/api';
import { Cancelamento } from '@/types';
import toast from 'react-hot-toast';

export default function AdminCancelamentosPage() {
  const [cancelamentos, setCancelamentos] = useState<Cancelamento[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await cancelamentosApi.listar();
      setCancelamentos(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Cancelamentos</h3>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : cancelamentos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum cancelamento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Venda</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Motivo</th>
                  <th className="px-4 py-3 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {cancelamentos.map((c) => (
                  <tr key={c.id_cancelamento} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{c.id_cancelamento}</td>
                    <td className="px-4 py-3">{c.id_venda}</td>
                    <td className="px-4 py-3">{c.id_cliente || '-'}</td>
                    <td className="px-4 py-3">{c.motivo || '-'}</td>
                    <td className="px-4 py-3">{new Date(c.data_cancelamento).toLocaleString('pt-BR')}</td>
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