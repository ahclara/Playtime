'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaShoppingCart, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getCart } from '@/lib/cart';
import Logo from './Logo';

const AVISOS = [
  'A fábrica de brinquedos está aberta — entre se tiver coragem',
  'Pague com PIX, cartão ou dinheiro',
  'Estoque limitado: quando acaba, acabou',
  'Novos brinquedos saindo da linha de montagem',
];

function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % AVISOS.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-[var(--red)] text-[var(--paper)] border-b-[3px] border-[var(--ink)]">
      <p key={i} className="ticker-in mono text-center text-[0.78rem] tracking-[0.18em] uppercase py-2 px-4 truncate">
        ★ {AVISOS[i]} ★
      </p>
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [bump, setBump] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const anterior = useRef(0);

  useEffect(() => {
    const updateCart = () => {
      const total = getCart().reduce((sum, item) => sum + item.quantidade, 0);
      if (total > anterior.current) {
        setBump(true);
        setTimeout(() => setBump(false), 350);
      }
      anterior.current = total;
      setCartCount(total);
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  useEffect(() => setMenuAberto(false), [pathname]);

  if (!user) return null;

  const links = [
    { href: '/produtos', label: 'Brinquedos' },
    { href: '/compras', label: 'Minhas compras' },
    ...(user.perfil === 'gerente' ? [{ href: '/admin', label: 'Gerência' }] : []),
  ];
  const ativo = (href: string) => (href === '/admin' ? pathname.startsWith('/admin') : pathname === href);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />
      <div className="bg-ink/95 backdrop-blur">
        <div className="max-w-[1240px] mx-auto px-5 h-[74px] flex items-center justify-between gap-6">
          <Logo size={30} />

          <nav className="hidden md:flex items-center gap-7" aria-label="Principal">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" aria-current={ativo(l.href) ? 'page' : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/carrinho"
              className={`btn btn-hazard btn-sm relative ${bump ? 'scale-110' : ''}`}
              aria-label={`Carrinho, ${cartCount} itens`}
            >
              <FaShoppingCart />
              <span className="hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 min-w-[26px] h-[26px] px-1 grid place-items-center rounded-full bg-[var(--red)] text-[var(--paper)] border-[2.5px] border-[var(--ink)] text-[0.8rem] font-bold font-sans">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden lg:flex items-center gap-2 pl-2">
              <span
                className="w-10 h-10 grid place-items-center rounded-full display text-lg text-[var(--ink)] bg-[var(--teal)] border-[3px] border-[var(--cream)]"
                aria-hidden
              >
                {user.nome.charAt(0).toUpperCase()}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold max-w-[140px] truncate">{user.nome}</span>
                <span className="block mono text-[0.68rem] tracking-[0.15em] uppercase text-[var(--muted)]">{user.perfil}</span>
              </span>
            </div>

            <button onClick={logout} className="!hidden md:!inline-flex btn btn-ghost btn-xs" title="Sair" aria-label="Sair">
              <FaSignOutAlt />
            </button>

            <button
              className="md:!hidden btn btn-ghost btn-xs"
              onClick={() => setMenuAberto((v) => !v)}
              aria-expanded={menuAberto}
              aria-label="Abrir menu"
            >
              {menuAberto ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
        <div className="hazard hazard-thin" />
      </div>

      {menuAberto && (
        <div className="md:hidden bg-[var(--ink-2)] border-b-[3px] border-[var(--red)] px-5 py-4 rise">
          <p className="mono text-xs tracking-[0.15em] uppercase text-[var(--muted)] mb-3">
            {user.nome} · {user.perfil}
          </p>
          <nav className="flex flex-col gap-3" aria-label="Menu">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link text-xl w-fit" aria-current={ativo(l.href) ? 'page' : undefined}>
                {l.label}
              </Link>
            ))}
            <button onClick={logout} className="nav-link text-xl w-fit text-left text-[var(--red-hot)]">
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
