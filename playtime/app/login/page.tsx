"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const dadosLogin = {
      email: email,
      cpf: cpf
    };

    console.log("Tentando fazer login com:", dadosLogin);
    if (email && cpf) {
      window.location.href = "/menu";
    } else {
      alert("Por favor, preencha todos os campos!");
    }
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
            <label className="block text-gray-700 mb-2">CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-bold">
            Entrar
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          Não tem conta? <Link href="/cadastro" className="text-blue-600">Cadastre-se</Link>
        </p>
        
        <div className="mt-4 pt-4 border-t text-center text-xs text-gray-400">
          <p>Utilize seu E-mail e CPF para acessar</p>
        </div>
      </div>
    </div>
  );
}