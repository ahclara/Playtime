"use client";
import Link from "next/link";
import { useState } from "react";

export default function CompraPage() {
  const [carrinho, setCarrinho] = useState([
    { id: 1, nome: "Boneca Ana", preco: 49.99, quantidade: 2 },
    { id: 2, nome: "Carrinho F1", preco: 89.90, quantidade: 1 },
  ]);

  const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const [comprou, setComprou] = useState(false);

  const finalizarCompra = () => {
    setComprou(true);
    setTimeout(() => {
      window.location.href = "/menu";
    }, 2000);
  };

  if (comprou) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600">Compra realizada com sucesso!</h1>
          <p className="text-gray-600 mt-2">Redirecionando para o menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/pesquisa" className="text-blue-600">← Voltar</Link>
          <h1 className="text-xl font-bold text-blue-600">Playtime</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Carrinho de Compras</h1>

        <div className="bg-white rounded-lg shadow-md mb-6">
          {carrinho.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 border-b">
              <div>
                <p className="font-medium">{item.nome}</p>
                <p className="text-sm text-gray-500">R$ {item.preco.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span>Qtd: {item.quantidade}</span>
                <span className="font-medium">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
              </div>
            </div>
          ))}
          
          <div className="p-4 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-xl text-green-600">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={finalizarCompra}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Finalizar Compra
          </button>
          <Link href="/pesquisa" className="flex-1">
            <button className="w-full bg-gray-400 text-white py-3 rounded-lg font-bold hover:bg-gray-500">
              Adicionar mais itens
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}