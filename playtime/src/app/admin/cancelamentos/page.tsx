'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cancelamentosApi } from '@/services/api';
import { Cancelamento } from '@/types';
import { formatDataHora } from '@/lib/format';
import Loader from '@/components/Loader';

export default function AdminCancelamentosPage() {
  const [cancelamentos, setCancelamentos] = useState<Cancelamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cancelamentosApi
      .listar()
      .then(setCancelamentos)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="paper overflow-hidden">
      {loading ? (
        <Loader dark />
      ) : cancelamentos.length === 0 ? (
        <div className="empty">
          <p className="display">Nenhum cancelamento</p>
          <p>Nenhum pedido foi cancelado até agora.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Motivo</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {cancelamentos.map((c) => (
                <tr key={c.id_cancelamento}>
                  <td className="id">#{c.id_cancelamento}</td>
                  <td>
                    <span className="badge badge-danger">#{c.id_venda}</span>
                  </td>
                  <td>{c.id_cliente || '—'}</td>
                  <td className="max-w-[360px]">{c.motivo || '—'}</td>
                  <td className="mono text-sm whitespace-nowrap">{formatDataHora(c.data_cancelamento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
