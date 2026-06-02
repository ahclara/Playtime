"use client";
import Link from "next/link";
import { useState } from "react";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/menu";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Cadastro</h1>
        
        <form onSubmit={handleCadastro}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nome completo</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
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
          <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
            Cadastrar
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem conta? <Link href="/login" className="text-blue-600">Faça login</Link>
        </p>
      </div>
    </div>
  );
}