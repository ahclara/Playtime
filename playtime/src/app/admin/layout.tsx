'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBox, FaUsers, FaReceipt, FaBan, FaChartBar, FaWarehouse } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/Loader';

const ADMIN_TABS = [
  { label: 'Painel', href: '/admin', Icon: FaWarehouse },
  { label: 'Produtos', href: '/admin/produtos', Icon: FaBox },
  { label: 'Clientes', href: '/admin/clientes', Icon: FaUsers },
  { label: 'Vendas', href: '/admin/vendas', Icon: FaReceipt },
  { label: 'Cancelamentos', href: '/admin/cancelamentos', Icon: FaBan },
  { label: 'Relatórios', href: '/admin/relatorios', Icon: FaChartBar },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const gerente = user?.perfil === 'gerente';

  useEffect(() => {
    if (user && !gerente) router.replace('/produtos');
  }, [user, gerente, router]);

  if (!gerente) {
    return (
      <div className="page">
        <Loader label="Acesso restrito a gerentes" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow mb-2">Sala de controle</p>
          <h1 className="page-title">Gerência</h1>
        </div>
      </div>

      <nav className="flex gap-1.5 overflow-x-auto scrollbar-none border-b-[3px] border-[var(--hazard)] -mx-1 px-1" aria-label="Gerência">
        {ADMIN_TABS.map(({ label, href, Icon }) => (
          <Link key={href} href={href} className="tab" aria-current={pathname === href ? 'page' : undefined}>
            <Icon /> {label}
          </Link>
        ))}
      </nav>

      <div className="pt-8">{children}</div>
    </div>
  );
}
