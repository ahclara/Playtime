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
  btnEntrar: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  btnEntrarHover: {
    backgroundColor: '#4338ca',
  },
  linkCadastro: {
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

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('Duda@gmail.com');
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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          Play<span style={styles.logoDestaque}>time</span>
        </div>
        <p style={styles.subtitle}>Gestão de Vendas e Produtos</p>

        {error && <div style={styles.erro}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Duda@gmail.com"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            style={styles.btnEntrar}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={styles.linkCadastro}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" style={styles.linkA}>
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}