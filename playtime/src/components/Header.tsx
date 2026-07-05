'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { FaGamepad, FaShoppingCart } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('carrinho') || '[]');
      const total = cart.reduce((sum: number, item: any) => sum + item.quantidade, 0);
      setCartCount(total);
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
        <Link href="/produtos" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <FaGamepad className="text-primary" />
          <span>Play<span className="text-primary">time</span></span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/produtos" className={`text-sm font-medium transition ${isActive('/produtos') ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}>
            Produtos
          </Link>
          <Link href="/carrinho" className={`text-sm font-medium transition flex items-center gap-1 ${isActive('/carrinho') ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}>
            <FaShoppingCart />
            Carrinho
            {cartCount > 0 && (
              <span className="bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/compras" className={`text-sm font-medium transition ${isActive('/compras') ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}>
            Minhas Compras
          </Link>
          {user.perfil === 'gerente' && (
            <Link href="/admin" className={`text-sm font-medium transition ${isActive('/admin') ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}>
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">{user.nome}</span>
          <div className="w-8 h-8 rounded-full bg-primary-bg text-primary flex items-center justify-center font-bold text-sm">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-danger transition px-3 py-1 rounded hover:bg-red-50"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}