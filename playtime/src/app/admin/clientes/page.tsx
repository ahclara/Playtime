'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authApi, clientesApi } from '@/services/api';
import { Cliente } from '@/types';
import Modal from '@/components/modal';
import Loader from '@/components/Loader';

const FORM_VAZIO = { nome: '', cpf: '', email: '', senha: '', perfil: 'cliente' };
const CORES = ['var(--red)', 'var(--teal)', 'var(--hazard)', '#8b5cf6', '#ff7a1a', '#3fbf5f'];

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [excluir, setExcluir] = useState<Cliente | null>(null);

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

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return t ? clientes.filter((c) => `${c.nome} ${c.email} ${c.cpf}`.toLowerCase().includes(t)) : clientes;
  }, [clientes, busca]);

  const abrirModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditando(cliente);
      setForm({ nome: cliente.nome, cpf: cliente.cpf, email: cliente.email, senha: '', perfil: 'cliente' });
    } else {
      setEditando(null);
      setForm(FORM_VAZIO);
    }
    setModalOpen(true);
  };

  const salvar = async () => {
    if (!form.nome || !form.cpf || !form.email) {
      toast.error('Preencha todos os campos.');
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await clientesApi.atualizar(editando.id_cliente, { nome: form.nome, email: form.email, cpf: form.cpf });
        toast.success('Cliente atualizado.');
      } else {
        if (!form.senha || form.senha.length < 6) {
          toast.error('Senha deve ter 6+ caracteres.');
          return;
        }
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
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async () => {
    if (!excluir) return;
    try {
      await clientesApi.deletar(excluir.id_cliente);
      toast.success('Cliente excluído.');
      setExcluir(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <label className="input-icon block w-full sm:w-80">
          <FaSearch />
          <input className="input" placeholder="Nome, e-mail ou CPF..." value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Filtrar clientes" />
        </label>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          <FaPlus /> Novo cliente
        </button>
      </div>

      <div className="paper overflow-hidden">
        {loading ? (
          <Loader dark />
        ) : filtrados.length === 0 ? (
          <div className="empty">
            <p className="display">Nenhum cliente</p>
            <p>{busca ? 'Nada encontrado com esse filtro.' : 'Ainda não há clientes cadastrados.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.id_cliente}>
                    <td className="id">#{c.id_cliente}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 shrink-0 grid place-items-center rounded-full border-[2.5px] border-[var(--ink)] display text-base"
                          style={{ background: CORES[c.id_cliente % CORES.length] }}
                          aria-hidden
                        >
                          {c.nome.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold">{c.nome}</span>
                      </div>
                    </td>
                    <td className="mono text-sm">{c.cpf}</td>
                    <td>{c.email}</td>
                    <td>
                      <div className="row-actions justify-end">
                        <button className="btn btn-hazard btn-xs" onClick={() => abrirModal(c)} title="Editar" aria-label={`Editar ${c.nome}`}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-danger btn-xs" onClick={() => setExcluir(c)} title="Excluir" aria-label={`Excluir ${c.nome}`}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar cliente' : 'Novo cliente'}
        onConfirm={salvar}
        confirmText="Salvar"
        loading={salvando}
      >
        <label className="field">
          <span className="field-label">Nome</span>
          <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field">
            <span className="field-label">CPF</span>
            <input className="input" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} disabled={!!editando} />
          </label>
          {!editando && (
            <label className="field">
              <span className="field-label">Perfil</span>
              <select className="input" value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })}>
                <option value="cliente">Cliente</option>
                <option value="vendedor">Vendedor</option>
                <option value="gerente">Gerente</option>
              </select>
            </label>
          )}
        </div>
        <label className="field">
          <span className="field-label">E-mail</span>
          <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        {!editando && (
          <label className="field !mb-0">
            <span className="field-label">Senha</span>
            <input type="password" className="input" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} placeholder="Mínimo 6 caracteres" />
          </label>
        )}
      </Modal>

      <Modal isOpen={!!excluir} onClose={() => setExcluir(null)} title="Excluir cliente" onConfirm={deletar} confirmText="Excluir" danger>
        <p>
          Excluir <strong>{excluir?.nome}</strong>? Essa ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
