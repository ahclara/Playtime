'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBox, FaUsers, FaReceipt, FaBan, FaChartBar, FaWarehouse } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/Loader';
import { isEquipe } from '@/lib/perfil';

type PerfilEquipe = 'vendedor' | 'gerente';

// O vendedor só vê Clientes e Vendas; o gerente vê tudo.
const ADMIN_TABS: { label: string; href: string; Icon: typeof FaBox; perfis: PerfilEquipe[] }[] = [
  { label: 'Painel', href: '/admin', Icon: FaWarehouse, perfis: ['gerente'] },
  { label: 'Produtos', href: '/admin/produtos', Icon: FaBox, perfis: ['gerente'] },
  { label: 'Clientes', href: '/admin/clientes', Icon: FaUsers, perfis: ['gerente', 'vendedor'] },
  { label: 'Vendas', href: '/admin/vendas', Icon: FaReceipt, perfis: ['gerente', 'vendedor'] },
  { label: 'Cancelamentos', href: '/admin/cancelamentos', Icon: FaBan, perfis: ['gerente'] },
  { label: 'Relatórios', href: '/admin/relatorios', Icon: FaChartBar, perfis: ['gerente'] },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const gerente = user?.perfil === 'gerente';
  const equipe = isEquipe(user?.perfil);
  const tabs = ADMIN_TABS.filter((t) => equipe && t.perfis.includes(user!.perfil as PerfilEquipe));
  const rota = ADMIN_TABS.find((t) => t.href === pathname);
  const podeVerRota = equipe && (!rota || tabs.includes(rota));
  const destino = tabs[0]?.href;

  useEffect(() => {
    if (!user) return;
    if (!equipe) router.replace('/produtos');
    else if (!podeVerRota && destino) router.replace(destino);
  }, [user, equipe, podeVerRota, destino, router]);

  if (!podeVerRota) {
    return (
      <div className="page">
        <Loader label="Acesso restrito" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow mb-2">{gerente ? 'Sala de controle' : 'Atendimento'}</p>
          <h1 className="page-title">{gerente ? 'Gerência' : 'Balcão'}</h1>
        </div>
      </div>

      <nav className="flex gap-1.5 overflow-x-auto scrollbar-none border-b-[3px] border-[var(--hazard)] -mx-1 px-1" aria-label={gerente ? 'Gerência' : 'Balcão'}>
        {tabs.map(({ label, href, Icon }) => (
          <Link key={href} href={href} className="tab" aria-current={pathname === href ? 'page' : undefined}>
            <Icon /> {label}
          </Link>
        ))}
      </nav>

      <div className="pt-8">{children}</div>
    </div>
  );
}
