'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaEye, FaCheck } from 'react-icons/fa';
import { Venda } from '@/types';
import { vendasApi } from '@/services/api';
import { formatBRL, formatData, statusBadge } from '@/lib/format';
import Loader from '@/components/Loader';
import ToyBoxArt from '@/components/ToyBoxArt';
import VendaDetalhe from '@/components/VendaDetalhe';

export default function ComprasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [detalhe, setDetalhe] = useState<number | null>(null);
  const fecharDetalhe = useCallback(() => setDetalhe(null), []);

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

  const gasto = vendas.filter((v) => v.status === 'pago').reduce((s, v) => s + Number(v.valor_total), 0);
  const pendentes = vendas.filter((v) => v.status === 'pendente').length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow mb-2">Histórico</p>
          <h1 className="page-title">Minhas compras</h1>
        </div>
        {!loading && vendas.length > 0 && (
          <div className="flex gap-6">
            <div>
              <p className="display text-3xl text-[var(--hazard)] text-shadow-ink">{formatBRL(gasto)}</p>
              <p className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--muted)]">em compras pagas</p>
            </div>
            <div>
              <p className="display text-3xl text-[var(--hazard)] text-shadow-ink">{pendentes}</p>
              <p className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--muted)]">pendentes</p>
            </div>
          </div>
        )}
      </div>

      <div className="paper overflow-hidden">
        {loading ? (
          <Loader dark />
        ) : vendas.length === 0 ? (
          <div className="empty">
            <ToyBoxArt className="w-44 mx-auto" />
            <p className="display">Nenhuma compra ainda</p>
            <p className="mb-6">Quando você comprar um brinquedo, ele aparece aqui.</p>
            <Link href="/produtos" className="btn btn-primary">
              Ver brinquedos
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v.id_venda}>
                    <td className="id">#{v.id_venda}</td>
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
                          <button className="btn btn-success btn-xs" onClick={() => finalizar(v.id_venda)}>
                            <FaCheck /> Finalizar
                          </button>
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
    </div>
  );
}
