'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaWarehouse, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { produtosApi } from '@/services/api';
import { Produto } from '@/types';
import { formatBRL } from '@/lib/format';
import Modal from '@/components/modal';
import Loader from '@/components/Loader';
import { ToyThumb } from '@/components/ToyArt';

const FORM_VAZIO = { nome: '', preco_unitario: 0, estoque: 0, categoria: '', descricao: '' };

function EstoqueTag({ n }: { n: number }) {
  const cls = n <= 0 ? 'badge-danger' : n <= 5 ? 'badge-warning' : 'badge-success';
  return <span className={`badge ${cls} tabular-nums`}>{n <= 0 ? 'Esgotado' : `${n} un`}</span>;
}

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const [estoqueDe, setEstoqueDe] = useState<Produto | null>(null);
  const [qtdEstoque, setQtdEstoque] = useState('');

  const [excluir, setExcluir] = useState<Produto | null>(null);

  const load = async () => {
    try {
      const data = await produtosApi.listar();
      setProdutos(data);
      return data;
    } catch (err: any) {
      toast.error(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().then((data) => {
      // vindo da vitrine: /admin/produtos?editar=ID
      const id = Number(new URLSearchParams(window.location.search).get('editar'));
      const alvo = id ? data.find((p) => p.id_produto === id) : undefined;
      if (alvo) abrirModal(alvo);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return t ? produtos.filter((p) => `${p.nome} ${p.categoria || ''}`.toLowerCase().includes(t)) : produtos;
  }, [produtos, busca]);

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
      setForm(FORM_VAZIO);
    }
    setModalOpen(true);
  };

  const salvar = async () => {
    if (!form.nome || form.preco_unitario <= 0) {
      toast.error('Preencha nome e preço corretamente.');
      return;
    }
    setSalvando(true);
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
    } finally {
      setSalvando(false);
    }
  };

  const salvarEstoque = async () => {
    if (!estoqueDe) return;
    const num = parseInt(qtdEstoque);
    if (isNaN(num) || num === 0) {
      toast.error('Digite um número válido.');
      return;
    }
    try {
      await produtosApi.atualizarEstoque(estoqueDe.id_produto, num);
      toast.success('Estoque atualizado.');
      setEstoqueDe(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deletar = async () => {
    if (!excluir) return;
    try {
      await produtosApi.deletar(excluir.id_produto);
      toast.success('Produto excluído.');
      setExcluir(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const previaEstoque = estoqueDe ? estoqueDe.estoque + (parseInt(qtdEstoque) || 0) : 0;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <label className="input-icon block w-full sm:w-80">
          <FaSearch />
          <input className="input" placeholder="Filtrar produtos..." value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Filtrar produtos" />
        </label>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          <FaPlus /> Novo produto
        </button>
      </div>

      <div className="paper overflow-hidden">
        {loading ? (
          <Loader dark />
        ) : filtrados.length === 0 ? (
          <div className="empty">
            <p className="display">Nenhum produto</p>
            <p>{busca ? 'Nada encontrado com esse filtro.' : 'Cadastre o primeiro brinquedo.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id_produto}>
                    <td className="id">#{p.id_produto}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <ToyThumb categoria={p.categoria} nome={p.nome} id={p.id_produto} size={40} />
                        <div>
                          <p className="font-semibold leading-tight">{p.nome}</p>
                          <p className="mono text-[0.7rem] tracking-[0.1em] uppercase text-[#7d6b62]">{p.categoria || 'Sem categoria'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="num font-semibold">{formatBRL(p.preco_unitario)}</td>
                    <td>
                      <EstoqueTag n={p.estoque} />
                    </td>
                    <td>
                      <div className="row-actions justify-end">
                        <button className="btn btn-hazard btn-xs" onClick={() => abrirModal(p)} title="Editar" aria-label={`Editar ${p.nome}`}>
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-success btn-xs"
                          onClick={() => {
                            setEstoqueDe(p);
                            setQtdEstoque('');
                          }}
                          title="Ajustar estoque"
                          aria-label={`Ajustar estoque de ${p.nome}`}
                        >
                          <FaWarehouse />
                        </button>
                        <button className="btn btn-danger btn-xs" onClick={() => setExcluir(p)} title="Excluir" aria-label={`Excluir ${p.nome}`}>
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

      {/* criar / editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar produto' : 'Novo produto'}
        onConfirm={salvar}
        confirmText="Salvar"
        loading={salvando}
      >
        <label className="field">
          <span className="field-label">Nome</span>
          <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ursinho de pelúcia" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field">
            <span className="field-label">Preço (R$)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.preco_unitario}
              onChange={(e) => setForm({ ...form, preco_unitario: parseFloat(e.target.value) || 0 })}
            />
          </label>
          <label className="field">
            <span className="field-label">Estoque</span>
            <input
              type="number"
              min="0"
              className="input"
              value={form.estoque}
              onChange={(e) => setForm({ ...form, estoque: parseInt(e.target.value) || 0 })}
            />
          </label>
        </div>
        <label className="field">
          <span className="field-label">Categoria</span>
          <input className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Pelúcia, Blocos, Carrinhos..." />
        </label>
        <label className="field !mb-0">
          <span className="field-label">Descrição</span>
          <textarea className="input" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        </label>
      </Modal>

      {/* estoque */}
      <Modal isOpen={!!estoqueDe} onClose={() => setEstoqueDe(null)} title="Ajustar estoque" onConfirm={salvarEstoque} confirmText="Atualizar">
        <p className="mb-4">
          <strong>{estoqueDe?.nome}</strong> tem hoje <strong>{estoqueDe?.estoque}</strong> unidade(s).
        </p>
        <label className="field">
          <span className="field-label">Quantidade (+ entrada / − saída)</span>
          <input
            type="number"
            className="input"
            value={qtdEstoque}
            onChange={(e) => setQtdEstoque(e.target.value)}
            placeholder="Ex.: 10 ou -3"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && salvarEstoque()}
          />
        </label>
        {qtdEstoque && !isNaN(parseInt(qtdEstoque)) && (
          <p className="mono text-sm">
            Novo estoque: <strong className={previaEstoque < 0 ? 'text-[var(--red)]' : ''}>{previaEstoque}</strong>
          </p>
        )}
      </Modal>

      {/* excluir */}
      <Modal isOpen={!!excluir} onClose={() => setExcluir(null)} title="Excluir produto" onConfirm={deletar} confirmText="Excluir" danger>
        <p>
          Excluir <strong>{excluir?.nome}</strong>? Essa ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
