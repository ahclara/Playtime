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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const usuario: Usuario = {
          id_usuario: payload.id_usuario,
          id_cliente: payload.id_cliente,
          email: payload.email,
          perfil: payload.perfil,
          nome: payload.nome || 'Usuário',
        };
        setUser(usuario);
      } catch {
        api.clearToken();
      }
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