'use client';

import { useEffect, useState } from 'react';
import { produtosApi } from '@/services/api';
import { Produto } from '@/types';
import { FaPlus, FaEdit, FaTrash, FaWarehouse } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await produtosApi.listar();
      setProdutos(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deletar = async (id: number) => {
    if (!confirm('Excluir este produto?')) return;
    try {
      await produtosApi.deletar(id);
      toast.success('Produto excluído.');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Modal para criar/editar (simplificado)
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState({ nome: '', preco_unitario: 0, estoque: 0, categoria: '', descricao: '' });

  const abrirModal = (produto?: Produto) => {
    if (produto) {
      setEditando(produto);
      setForm({
        nome: produto.nome,
        preco_unitario: produto.preco_unitario,
        estoque: produto.estoque,
        categoria: produto.categoria || '',
        descricao: produto.descricao || '',
      });
    } else {
      setEditando(null);
      setForm({ nome: '', preco_unitario: 0, estoque: 0, categoria: '', descricao: '' });
    }
    setModalOpen(true);
  };

  const salvar = async () => {
    if (!form.nome || form.preco_unitario <= 0) {
      toast.error('Preencha nome e preço corretamente.');
      return;
    }
    try {
      if (editando) {
        await produtosApi.atualizar(editando.id_produto, form);
        toast.success('Produto atualizado.');
      } else {
        await produtosApi.criar(form);
        toast.success('Produto criado.');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const ajustarEstoque = async (id: number) => {
    const qtd = prompt('Quantidade (positiva para adicionar, negativa para remover):');
    if (qtd === null) return;
    const num = parseInt(qtd);
    if (isNaN(num) || num === 0) {
      toast.error('Digite um número válido.');
      return;
    }
    try {
      await produtosApi.atualizarEstoque(id, num);
      toast.success('Estoque atualizado.');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Produtos</h3>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          <FaPlus className="mr-1" /> Novo Produto
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum produto.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Preço</th>
                  <th className="px-4 py-3 text-left">Estoque</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id_produto} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{p.id_produto}</td>
                    <td className="px-4 py-3">{p.nome}</td>
                    <td className="px-4 py-3">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco_unitario)}</td>
                    <td className="px-4 py-3">{p.estoque}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="btn btn-primary btn-xs" onClick={() => abrirModal(p)}>
                        <FaEdit />
                      </button>
                      <button className="btn btn-warning btn-xs" onClick={() => ajustarEstoque(p.id_produto)}>
                        <FaWarehouse />
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => deletar(p.id_produto)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal simples */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editando ? 'Editar' : 'Novo'} Produto</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço"
                value={form.preco_unitario}
                onChange={(e) => setForm({ ...form, preco_unitario: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="number"
                placeholder="Estoque"
                value={form.estoque}
                onChange={(e) => setForm({ ...form, estoque: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Categoria"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <textarea
                placeholder="Descrição"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}