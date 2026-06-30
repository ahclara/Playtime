"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface HistoricoVenda {
  id: number;
  cliente: string;
  total: number;
  status: string;
  data: string;
}

export default function VendaPage() {
  const [vendas, setVendas] = useState<HistoricoVenda[]>([]);
  
  useEffect(() => {
    fetch('http://127.0.0.1:5000/vendas')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar histórico de vendas');
        }
        return response.json();
      })
      .then(dados => {
        setVendas(dados); 
      })
      .catch(error => {
        console.error('Erro ao carregar histórico:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/menu" className="text-blue-600">← Voltar ao Menu</Link>
          <h1 className="text-xl font-bold text-blue-600">Playtime</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Corpo da Página */}
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Histórico de Vendas</h1>
        <p className="text-gray-500 mb-6">Relatório de pedidos e faturamento da loja</p>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left text-gray-600">ID Pedido</th>
                <th className="p-3 text-left text-gray-600">Cliente</th>
                <th className="p-3 text-center text-gray-600">Data</th>
                <th className="p-3 text-center text-gray-600">Status</th>
                <th className="p-3 text-right text-gray-600">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((v) => (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-bold text-blue-600">#{v.id}</td>
                  <td className="p-3 font-medium text-gray-800">{v.cliente}</td>
                  <td className="p-3 text-center text-gray-500">
                    {new Date(v.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      v.status === "pago" || v.status === "finalizado"
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-gray-900">
                    R$ {Number(v.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {vendas.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhuma venda registrada no banco de dados ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}