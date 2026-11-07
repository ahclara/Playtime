'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { relatoriosApi } from '@/services/api';
import { formatBRL } from '@/lib/format';
import Loader from '@/components/Loader';
import { ToyThumb } from '@/components/ToyArt';

function Ranking<T>({
  titulo,
  itens,
  valor,
  rotulo,
  render,
  cor,
}: {
  titulo: string;
  itens: T[];
  valor: (i: T) => number;
  rotulo: (i: T) => string;
  render: (i: T, idx: number) => React.ReactNode;
  cor: string;
}) {
  const max = Math.max(1, ...itens.map(valor));
  return (
    <section className="paper p-6">
      <h3 className="display text-2xl mb-4">{titulo}</h3>
      {itens.length === 0 ? (
        <p className="text-sm text-[#7d6b62]">Nenhum dado ainda.</p>
      ) : (
        <ol className="space-y-4">
          {itens.map((item, idx) => (
            <li key={idx}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="display w-7 text-xl text-[#7d6b62]">{idx + 1}</span>
                {render(item, idx)}
                <span className="mono text-sm tabular-nums whitespace-nowrap">{rotulo(item)}</span>
              </div>
              <div className="ml-10 h-3 rounded-full border-2 border-[var(--ink)] bg-[#fffaf0] overflow-hidden">
                <div className="h-full" style={{ width: `${(valor(item) / max) * 100}%`, background: cor }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function AdminRelatoriosPage() {
  const [geral, setGeral] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    relatoriosApi
      .geral()
      .then(setGeral)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Calculando relatórios..." />;
  if (!geral)
    return (
      <div className="paper empty">
        <p className="display">Erro ao carregar</p>
        <p>Não foi possível buscar os relatórios.</p>
      </div>
    );

  const numeros = [
    { l: 'Clientes', v: geral.total_clientes || 0 },
    { l: 'Produtos', v: geral.total_produtos || 0 },
    { l: 'Vendas concluídas', v: geral.total_vendas_concluidas || 0 },
    { l: 'Total arrecadado', v: formatBRL(geral.total_arrecadado) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {numeros.map((n, i) => (
          <div key={n.l} className="paper p-5" style={{ background: i === 3 ? 'var(--hazard)' : undefined }}>
            <p className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[#5b4d46]">{n.l}</p>
            <p className="display text-[2rem] mt-2 leading-none">{n.v}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Ranking
          titulo="Produtos mais vendidos"
          itens={geral.produtos_mais_vendidos || []}
          valor={(p: any) => Number(p.total_vendido) || 0}
          rotulo={(p: any) => `${p.total_vendido} un`}
          cor="var(--red)"
          render={(p: any, i) => (
            <>
              <ToyThumb nome={p.nome} id={i} size={32} />
              <span className="flex-1 font-semibold truncate">{p.nome}</span>
            </>
          )}
        />
        <Ranking
          titulo="Melhores clientes"
          itens={geral.clientes_top || []}
          valor={(c: any) => Number(c.total_gasto) || 0}
          rotulo={(c: any) => formatBRL(c.total_gasto)}
          cor="var(--teal)"
          render={(c: any) => <span className="flex-1 font-semibold truncate">{c.nome}</span>}
        />
      </div>
    </div>
  );
}
