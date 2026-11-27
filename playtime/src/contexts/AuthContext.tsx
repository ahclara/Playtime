'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, authApi } from '@/services/api';
import { Usuario } from '@/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextData {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  register: (dados: { nome: string; cpf: string; email: string; senha: string; perfil?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/** Decodifica o payload do JWT (base64url + UTF-8, para nomes com acento). */
function lerToken(token: string): Usuario | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null; // expirado
    return {
      id_usuario: payload.id_usuario,
      id_cliente: payload.id_cliente,
      email: payload.email,
      perfil: payload.perfil,
      nome: payload.nome || 'Usuário',
    };
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      const usuario = lerToken(token);
      if (usuario) setUser(usuario);
      else api.clearToken();
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const data = await authApi.login(email, senha);
    api.setToken(data.token);
    setUser(data.usuario);
    toast.success('Login realizado com sucesso!');
    router.push('/produtos');
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    toast.success('Logout realizado.');
    router.push('/');
  };

  const register = async (dados: { nome: string; cpf: string; email: string; senha: string; perfil?: string }) => {
    await authApi.register(dados);
    toast.success('Cadastro realizado! Faça login.');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);