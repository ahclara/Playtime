'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f0eb',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2.5rem 2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center' as const,
    border: '1px solid #e8e0d8',
  },
  logo: {
    fontSize: '2.2rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  logoDestaque: {
    color: '#4f46e5',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '2rem',
  },
  formGroup: {
    textAlign: 'left' as const,
    marginBottom: '1.2rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.3rem',
  },
  input: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    borderColor: '#4f46e5',
    boxShadow: '0 0 0 3px rgba(79,70,229,0.15)',
  },
  select: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s',
  },
  btnCadastrar: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  btnCadastrarHover: {
    backgroundColor: '#16a34a',
  },
  linkLogin: {
    marginTop: '1.2rem',
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  linkA: {
    color: '#4f46e5',
    fontWeight: 500,
    textDecoration: 'none',
  },
  erro: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '0.5rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
};

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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          Play<span style={styles.logoDestaque}>time</span>
        </div>
        <p style={styles.subtitle}>Criar Conta</p>

        {error && <div style={styles.erro}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nome completo</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="João Silva"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>CPF</label>
            <input
              type="text"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Perfil</label>
            <select
              value={form.perfil}
              onChange={(e) => setForm({ ...form, perfil: e.target.value })}
              style={styles.select}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>
          <button
            type="submit"
            style={styles.btnCadastrar}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22c55e')}
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div style={styles.linkLogin}>
          Já tem uma conta?{' '}
          <Link href="/" style={styles.linkA}>
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}