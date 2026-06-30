"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Produto {
  id: number;
  nome: string;
  preco: number | string;
  categoria?: string;
  estoque: number;
}

export default function PesquisaPage() {
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/produtos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar produtos do servidor');
        }
        return response.json();
      })
      .then(dados => {
        setProdutos(dados); 
      })
      .catch(error => {
        console.error('Ih, deu erro ao carregar a pesquisa:', error);
      });
  }, []);

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

      //ver essas coisas da categoria, se muda, se retira.
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow-md p-4 border">
              <div className="text-3xl mb-2">
                {p.categoria === "Bonecas" && "🎎"}
                {p.categoria === "Veículos" && "🚗"}
                {p.categoria === "Montar" && "🧱"}
                {p.categoria === "Pelúcias" && "🧸"}
                {p.categoria === "Criatividade" && "🎨"}
                {!["Bonecas", "Veículos", "Montar", "Pelúcias", "Criatividade"].includes(p.categoria || "") && "🧸"}
              </div>
              <h3 className="font-bold text-lg">{p.nome}</h3>
              <p className="text-gray-500 text-sm">{p.categoria || "Geral"}</p>
              
              <p className="text-green-600 font-bold text-xl mt-2">
                R$ {Number(p.preco).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Estoque: {p.estoque} und</p>
              
              <Link href="/compra">
                <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-bold">
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