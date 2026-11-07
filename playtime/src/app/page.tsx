'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import AuthShell from '@/components/AuthShell';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('xxxx@xxxx.xx');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, senha);
    } catch (err: any) {
      setError(err.message || 'Falha no login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell kicker="Bem-vindo de volta" title="Os brinquedos |estão esperando| por você." ticket="Cartão de ponto · Acesso">
      <h2 className="display text-[2rem] text-[var(--ink)]">Bater o ponto</h2>
      <p className="text-sm text-[#5b4d46] mt-1 mb-6">Entre com seu e-mail e senha para abrir a fábrica.</p>

      {error && (
        <div className="alert-error" role="alert">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span className="field-label">E-mail</span>
          <span className="input-icon block">
            <FaEnvelope />
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
              required
            />
          </span>
        </label>
        <label className="field">
          <span className="field-label">Senha</span>
          <span className="input-icon block">
            <FaLock />
            <input
              type="password"
              className="input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </span>
        </label>

        <button type="submit" className="btn btn-primary btn-block mt-2 text-xl" disabled={loading}>
          {loading ? 'Abrindo os portões...' : 'Entrar'}
        </button>
      </form>

      <div className="receipt-sep mt-6" />
      <p className="text-sm text-[#5b4d46] text-center">
        Primeira vez por aqui?{' '}
        <Link href="/cadastro" className="font-bold text-[var(--red)] underline decoration-2 underline-offset-4 hover:text-[var(--ink)]">
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
