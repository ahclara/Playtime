'use client';

import { useEffect, useState } from 'react';
import { clientesApi } from '@/services/api';
import { Cliente } from '@/types';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await clientesApi.listar();
      setClientes(data);
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
    if (!confirm('Excluir este cliente?')) return;
    try {
      await clientesApi.deletar(id);
      toast.success('Cliente excluído.');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', senha: '', perfil: 'cliente' });

  const abrirModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditando(cliente);
      setForm({ nome: cliente.nome, cpf: cliente.cpf, email: cliente.email, senha: '', perfil: 'cliente' });
    } else {
      setEditando(null);
      setForm({ nome: '', cpf: '', email: '', senha: '', perfil: 'cliente' });
    }
    setModalOpen(true);
  };

  const salvar = async () => {
    if (!form.nome || !form.cpf || !form.email) {
      toast.error('Preencha todos os campos.');
      return;
    }
    try {
      if (editando) {
        await clientesApi.atualizar(editando.id_cliente, { nome: form.nome, email: form.email, cpf: form.cpf });
        toast.success('Cliente atualizado.');
      } else {
        if (!form.senha || form.senha.length < 6) {
          toast.error('Senha deve ter 6+ caracteres.');
          return;
        }
        // Usar a rota de registro (já que não temos uma rota específica de criação de cliente no admin)
        // Vamos usar o authApi.register, mas precisamos importar
        const { authApi } = await import('@/services/api');
        await authApi.register({
          nome: form.nome,
          cpf: form.cpf,
          email: form.email,
          senha: form.senha,
          perfil: form.perfil,
        });
        toast.success('Cliente registrado.');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Clientes</h3>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          <FaPlus className="mr-1" /> Novo Cliente
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum cliente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">CPF</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id_cliente} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{c.id_cliente}</td>
                    <td className="px-4 py-3">{c.nome}</td>
                    <td className="px-4 py-3">{c.cpf}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="btn btn-primary btn-xs" onClick={() => abrirModal(c)}>
                        <FaEdit />
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => deletar(c.id_cliente)}>
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editando ? 'Editar' : 'Novo'} Cliente</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="CPF"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                disabled={!!editando}
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              {!editando && (
                <>
                  <input
                    type="password"
                    placeholder="Senha"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <select
                    value={form.perfil}
                    onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </>
              )}
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