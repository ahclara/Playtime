"use client";
import Link from "next/link";
import { useState } from "react";

const produtosIniciais = [
  { id: 1, nome: "Boneca Ana", categoria: "Bonecas", preco: 49.99, quantidade: 15 },
  { id: 2, nome: "Carrinho F1", categoria: "Veículos", preco: 89.90, quantidade: 8 },
  { id: 3, nome: "Lego Castelo", categoria: "Montar", preco: 199.99, quantidade: 5 },
  { id: 4, nome: "Pelúcia Ursinho", categoria: "Pelúcias", preco: 39.90, quantidade: 12 },
];

export default function EstoquePage() {
  const [produtos, setProdutos] = useState(produtosIniciais);

  const atualizarQuantidade = (id: number, novaQtd: number) => {
    if (novaQtd >= 0) {
      setProdutos(produtos.map(p => p.id === id ? { ...p, quantidade: novaQtd } : p));
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestão de Estoque</h1>
        <p className="text-gray-500 mb-6">Controle as quantidades dos produtos</p>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Produto</th>
                <th className="p-3 text-left">Categoria</th>
                <th className="p-3 text-right">Preço</th>
                <th className="p-3 text-center">Quantidade</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.nome}</td>
                  <td className="p-3 text-gray-600">{p.categoria}</td>
                  <td className="p-3 text-right">R$ {p.preco.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={p.quantidade < 5 ? "text-red-600 font-bold" : ""}>
                      {p.quantidade}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => atualizarQuantidade(p.id, p.quantidade + 1)}
                      >
                        +1
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => atualizarQuantidade(p.id, p.quantidade - 1)}
                      >
                        -1
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>* Apenas gerente tem acesso a esta página</p>
        </div>
      </div>
    </div>
  );
}