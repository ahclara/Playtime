"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number | string;
  estoque: number; 
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);


  useEffect(() => {
    fetch('http://127.0.0.1:5000/produtos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar produtos para o estoque');
        }
        return response.json();
      })
      .then(dados => {
        setProdutos(dados); 
      })
      .catch(error => {
        console.error('Erro na conexão do estoque:', error);
      });
  }, []);

  const atualizarQuantidade = (id: number, novoEstoque: number) => {
    if (novoEstoque >= 0) {
      fetch(`http://127.0.0.1:5000/produtos/${id}/estoque`, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ quantidade: novoEstoque }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao atualizar estoque no servidor');
          }
          return response.json();
        })
        .then(dados => {
          console.log('Estoque atualizado com sucesso no banco!', dados);
          setProdutos(produtos.map(p => p.id === id ? { ...p, estoque: novoEstoque } : p));
        })
        .catch(error => {
          console.error('Erro ao atualizar estoque:', error);
          alert('Erro ao salvar no banco. Verifique se o servidor respondeu corretamente!');
        });
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
                  <td className="p-3 text-gray-600">{p.categoria || "Geral"}</td>
                  <td className="p-3 text-right">R$ {Number(p.preco).toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={p.estoque < 5 ? "text-red-600 font-bold" : ""}>
                      {p.estoque}
                    </span>
                  </td>
                  
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 font-bold"
                        onClick={() => atualizarQuantidade(p.id, p.estoque + 1)}
                      >
                        +1
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-bold"
                        onClick={() => atualizarQuantidade(p.id, p.estoque - 1)}
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