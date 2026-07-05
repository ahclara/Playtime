'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.perfil !== 'gerente') {
      router.push('/produtos');
    }
  }, [user, router]);

  if (!user || user.perfil !== 'gerente') {
    return <div className="text-center py-12">Acesso restrito a gerentes.</div>;
  }

  const tabs = [
    { label: 'Produtos', href: '/admin/produtos' },
    { label: 'Clientes', href: '/admin/clientes' },
    { label: 'Vendas', href: '/admin/vendas' },
    { label: 'Cancelamentos', href: '/admin/cancelamentos' },
    { label: 'Relatórios', href: '/admin/relatorios' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Administração</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="btn btn-primary text-sm"
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="card p-6 text-center text-gray-500">
        Selecione uma das opções acima para gerenciar.
      </div>
    </div>
  );
}