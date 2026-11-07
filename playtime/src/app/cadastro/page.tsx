'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import AuthShell from '@/components/AuthShell';

export default function CadastroPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    perfil: 'cliente',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [campo]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nome, cpf, email, senha } = form;
    if (!nome || !cpf || !email || !senha) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form);
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell kicker="Nova contratação" title="Entre para a |turma| da fábrica." ticket="Ficha de admissão · Nº 0001">
      <h2 className="display text-[2rem] text-[var(--ink)]">Criar conta</h2>
      <p className="text-sm text-[#5b4d46] mt-1 mb-5">Preencha a ficha. Todos os campos são obrigatórios.</p>

      {error && (
        <div className="alert-error" role="alert">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span className="field-label">Nome completo</span>
          <input type="text" className="input" value={form.nome} onChange={set('nome')} placeholder="João Silva" autoComplete="name" required />
        </label>
        <div className="grid sm:grid-cols-2 gap-x-3">
          <label className="field">
            <span className="field-label">CPF</span>
            <input type="text" className="input" value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" inputMode="numeric" required />
          </label>
          <label className="field">
            <span className="field-label">Perfil</span>
            <select className="input" value={form.perfil} onChange={set('perfil')}>
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
              <option value="gerente">Gerente</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span className="field-label">E-mail</span>
          <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="seu@email.com" autoComplete="email" required />
        </label>
        <label className="field">
          <span className="field-label">Senha</span>
          <input
            type="password"
            className="input"
            value={form.senha}
            onChange={set('senha')}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block mt-1 text-xl" disabled={loading}>
          {loading ? 'Carimbando a ficha...' : 'Cadastrar'}
        </button>
      </form>

      <div className="receipt-sep mt-6" />
      <p className="text-sm text-[#5b4d46] text-center">
        Já tem conta?{' '}
        <Link href="/" className="font-bold text-[var(--red)] underline decoration-2 underline-offset-4 hover:text-[var(--ink)]">
          Fazer login
        </Link>
      </p>
    </AuthShell>
  );
}
