'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaEye, FaCheck, FaBan } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { vendasApi } from '@/services/api';
import { Venda } from '@/types';
import { formatBRL, formatData, statusBadge } from '@/lib/format';
import Modal from '@/components/modal';
import Loader from '@/components/Loader';
import VendaDetalhe from '@/components/VendaDetalhe';

type Filtro = 'todas' | 'pendente' | 'pago' | 'cancelado';

export default function AdminVendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [detalhe, setDetalhe] = useState<number | null>(null);
  const [cancelarVenda, setCancelarVenda] = useState<Venda | null>(null);
  const [motivo, setMotivo] = useState('');
  const fecharDetalhe = useCallback(() => setDetalhe(null), []);

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

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todas: vendas.length, pendente: 0, pago: 0, cancelado: 0 };
    vendas.forEach((v) => (c[v.status] = (c[v.status] || 0) + 1));
    return c;
  }, [vendas]);

  const visiveis = filtro === 'todas' ? vendas : vendas.filter((v) => v.status === filtro);

  const finalizar = async (id: number) => {
    try {
      await vendasApi.finalizar(id);
      toast.success('Venda finalizada.');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const confirmarCancelamento = async () => {
    if (!cancelarVenda) return;
    try {
      await vendasApi.cancelar(cancelarVenda.id_venda, motivo || 'Cancelado pelo gerente');
      toast.success('Venda cancelada.');
      setCancelarVenda(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5" role="group" aria-label="Filtrar por status">
        {(['todas', 'pendente', 'pago', 'cancelado'] as Filtro[]).map((f) => (
          <button key={f} className="chip" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
            {f === 'todas' ? 'Todas' : f} <span className="count">{contagem[f] || 0}</span>
          </button>
        ))}
      </div>

      <div className="paper overflow-hidden">
        {loading ? (
          <Loader dark />
        ) : visiveis.length === 0 ? (
          <div className="empty">
            <p className="display">Nenhuma venda</p>
            <p>Não há vendas com esse status.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((v) => (
                  <tr key={v.id_venda}>
                    <td className="id">#{v.id_venda}</td>
                    <td className="font-semibold">{v.nome_cliente || `Cliente ${v.id_cliente}`}</td>
                    <td>{formatData(v.data_venda)}</td>
                    <td className="num font-semibold">{formatBRL(v.valor_total)}</td>
                    <td>
                      <span className={`badge ${statusBadge(v.status)}`}>{v.status}</span>
                    </td>
                    <td>
                      <div className="row-actions justify-end">
                        <button className="btn btn-outline btn-xs" onClick={() => setDetalhe(v.id_venda)} title="Ver itens" aria-label={`Ver pedido ${v.id_venda}`}>
                          <FaEye />
                        </button>
                        {v.status === 'pendente' && (
                          <>
                            <button className="btn btn-success btn-xs" onClick={() => finalizar(v.id_venda)} title="Finalizar" aria-label={`Finalizar pedido ${v.id_venda}`}>
                              <FaCheck />
                            </button>
                            <button
                              className="btn btn-danger btn-xs"
                              onClick={() => {
                                setCancelarVenda(v);
                                setMotivo('');
                              }}
                              title="Cancelar"
                              aria-label={`Cancelar pedido ${v.id_venda}`}
                            >
                              <FaBan />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VendaDetalhe idVenda={detalhe} onClose={fecharDetalhe} />

      <Modal
        isOpen={!!cancelarVenda}
        onClose={() => setCancelarVenda(null)}
        title={`Cancelar pedido #${cancelarVenda?.id_venda ?? ''}`}
        onConfirm={confirmarCancelamento}
        confirmText="Cancelar venda"
        cancelText="Voltar"
        danger
      >
        <p className="mb-4">
          Pedido de <strong>{cancelarVenda?.nome_cliente || `cliente ${cancelarVenda?.id_cliente}`}</strong> no valor de{' '}
          <strong>{formatBRL(cancelarVenda?.valor_total)}</strong>.
        </p>
        <label className="field !mb-0">
          <span className="field-label">Motivo</span>
          <textarea className="input" rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Cancelado pelo gerente" autoFocus />
        </label>
      </Modal>
    </div>
  );
}
