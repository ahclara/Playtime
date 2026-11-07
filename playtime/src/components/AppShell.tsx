'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Loader from './Loader';

const ROTAS_PUBLICAS = ['/', '/cadastro'];

/**
 * Decide a "moldura" da página:
 * - rotas públicas (login/cadastro) ocupam a tela inteira;
 * - demais rotas exigem login e ganham cabeçalho + rodapé.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const publica = ROTAS_PUBLICAS.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !publica) router.replace('/');
    if (user && publica) router.replace('/produtos');
  }, [loading, user, publica, router]);

  if (loading || (!user && !publica) || (user && publica)) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader label="Ligando as máquinas..." />
      </div>
    );
  }

  if (publica) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
