'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBox, FaUsers, FaReceipt, FaBan, FaChartBar, FaArrowRight } from 'react-icons/fa';
import { relatoriosApi } from '@/services/api';
import { formatBRL } from '@/lib/format';

const ATALHOS = [
  { label: 'Produtos', desc: 'Cadastrar, editar e repor estoque', href: '/admin/produtos', Icon: FaBox, cor: 'var(--red)' },
  { label: 'Clientes', desc: 'Fichas de clientes e acessos', href: '/admin/clientes', Icon: FaUsers, cor: 'var(--teal)' },
  { label: 'Vendas', desc: 'Finalizar ou cancelar pedidos', href: '/admin/vendas', Icon: FaReceipt, cor: 'var(--hazard)' },
  { label: 'Cancelamentos', desc: 'Histórico e motivos', href: '/admin/cancelamentos', Icon: FaBan, cor: '#8b5cf6' },
  { label: 'Relatórios', desc: 'Mais vendidos e melhores clientes', href: '/admin/relatorios', Icon: FaChartBar, cor: '#ff7a1a' },
];

export default function AdminPage() {
  const [geral, setGeral] = useState<any>(null);

  useEffect(() => {
    relatoriosApi
      .geral()
      .then(setGeral)
      .catch(() => setGeral(null));
  }, []);

  const numeros = [
    { l: 'Clientes', v: geral?.total_clientes },
    { l: 'Produtos', v: geral?.total_produtos },
    { l: 'Vendas pagas', v: geral?.total_vendas_concluidas },
    { l: 'Arrecadado', v: geral ? formatBRL(geral.total_arrecadado) : undefined },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {numeros.map((n) => (
          <div key={n.l} className="paper-dark p-5">
            <p className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--muted)]">{n.l}</p>
            <p className="display text-[2.2rem] mt-2 text-[var(--hazard)] text-shadow-ink">{n.v ?? '–'}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ATALHOS.map(({ label, desc, href, Icon, cor }) => (
          <Link key={href} href={href} className="paper toy-card p-5 group !flex-row items-center gap-4 no-underline text-[var(--ink)]">
            <span className="w-16 h-16 shrink-0 grid place-items-center rounded-xl border-[3px] border-[var(--ink)] text-2xl text-[var(--ink)]" style={{ background: cor, boxShadow: '3px 3px 0 var(--ink)' }}>
              <Icon />
            </span>
            <span className="flex-1">
              <span className="display text-2xl block leading-none">{label}</span>
              <span className="text-sm text-[#5b4d46]">{desc}</span>
            </span>
            <FaArrowRight className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
