"use client";
import Link from "next/link";
import { useState } from "react";

// Dados mockados (falsos) para demonstração
const produtos = [
  { id: 1, nome: "Boneca Ana", preco: 49.99, categoria: "Bonecas", estoque: 15 },
  { id: 2, nome: "Carrinho F1", preco: 89.90, categoria: "Veículos", estoque: 8 },
  { id: 3, nome: "Lego Castelo", preco: 199.99, categoria: "Montar", estoque: 5 },
  { id: 4, nome: "Pelúcia Ursinho", preco: 39.90, categoria: "Pelúcias", estoque: 12 },
  { id: 5, nome: "Massinha de Modelar", preco: 24.90, categoria: "Criatividade", estoque: 20 },
  { id: 6, nome: "Fazendinha", preco: 149.90, categoria: "Educativos", estoque: 7 },
  { id: 7, nome: "Patins Infantil", preco: 129.90, categoria: "Esportes", estoque: 4 },
  { id: 8, nome: "Quebra-cabeça", preco: 59.90, categoria: "Jogos", estoque: 10 },
];

export default function PesquisaPage() {
  const [busca, setBusca] = useState("");
  
  const filtrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/menu" className="text-blue-600">← Voltar ao Menu</Link>
          <h1 className="text-xl font-bold text-blue-600">Playtime</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pesquisar Produtos</h1>
        <p className="text-gray-500 mb-6">Encontre o brinquedo perfeito</p>

        <input
          type="text"
          placeholder="Digite o nome do produto..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-6"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow-md p-4 border">
              <div className="text-3xl mb-2">
                {p.categoria === "Bonecas" && "🎎"}
                {p.categoria === "Veículos" && "🚗"}
                {p.categoria === "Montar" && "🧱"}
                {p.categoria === "Pelúcias" && "🧸"}
                {p.categoria === "Criatividade" && "🎨"}
                {!["Bonecas", "Veículos", "Montar", "Pelúcias", "Criatividade"].includes(p.categoria) && "🧸"}
              </div>
              <h3 className="font-bold text-lg">{p.nome}</h3>
              <p className="text-gray-500 text-sm">{p.categoria}</p>
              <p className="text-green-600 font-bold text-xl mt-2">
                R$ {p.preco.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Estoque: {p.estoque} und</p>
              <Link href="/compra">
                <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  Comprar
                </button>
              </Link>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}