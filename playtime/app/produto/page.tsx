"use client";
import Link from "next/link";
import { useState } from "react";

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  quantidade: number;
}

export default function ProdutoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([
    { id: 1, nome: "Boneca Ana", categoria: "Bonecas", preco: 49.99, quantidade: 15 },
    { id: 2, nome: "Carrinho F1", categoria: "Veículos", preco: 89.90, quantidade: 8 },
  ]);
  
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoProduto, setNovoProduto] = useState({ nome: "", categoria: "", preco: "", quantidade: "" });

  const adicionarProduto = () => {
    if (!novoProduto.nome || !novoProduto.preco) return;
    
    const novo: Produto = {
      id: Date.now(),
      nome: novoProduto.nome,
      categoria: novoProduto.categoria || "Geral",
      preco: parseFloat(novoProduto.preco),
      quantidade: parseInt(novoProduto.quantidade) || 0,
    };
    
    setProdutos([...produtos, novo]);
    setNovoProduto({ nome: "", categoria: "", preco: "", quantidade: "" });
    setMostrarForm(false);
  };

  const excluirProduto = (id: number) => {
    if (confirm("Tem certeza?")) {
      setProdutos(produtos.filter(p => p.id !== id));
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h1>
            <p className="text-gray-500">Cadastre e edite produtos do catálogo</p>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Novo Produto
          </button>
        </div>

        {mostrarForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="font-bold mb-4">Cadastrar Novo Produto</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nome"
                className="border p-2 rounded"
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
              />
              <input
                type="text"
                placeholder="Categoria"
                className="border p-2 rounded"
                value={novoProduto.categoria}
                onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
              />
              <input
                type="number"
                placeholder="Preço"
                className="border p-2 rounded"
                value={novoProduto.preco}
                onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
              />
              <input
                type="number"
                placeholder="Quantidade"
                className="border p-2 rounded"
                value={novoProduto.quantidade}
                onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={adicionarProduto} className="bg-green-600 text-white px-4 py-2 rounded">
                Salvar
              </button>
              <button onClick={() => setMostrarForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Produto</th>
                <th className="p-3 text-left">Categoria</th>
                <th className="p-3 text-right">Preço</th>
                <th className="p-3 text-center">Estoque</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 text-gray-500">#{p.id}</td>
                  <td className="p-3 font-medium">{p.nome}</td>
                  <td className="p-3 text-gray-600">{p.categoria}</td>
                  <td className="p-3 text-right">R$ {p.preco.toFixed(2)}</td>
                  <td className="p-3 text-center">{p.quantidade}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => excluirProduto(p.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}