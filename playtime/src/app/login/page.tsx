"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/menu";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">Playtime</h1>
        <p className="text-center text-gray-500 mb-6">Sistema para Lojas de Brinquedos</p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Entrar
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          Não tem conta? <Link href="/cadastro" className="text-blue-600">Cadastre-se</Link>
        </p>
        
        <div className="mt-4 pt-4 border-t text-center text-xs text-gray-400">
          <p>Demonstração - Clique em Entrar para acessar</p>
        </div>
      </div>
    </div>
  );
}