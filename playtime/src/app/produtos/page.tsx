'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaArrowDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { produtosApi } from '@/services/api';
import { Produto } from '@/types';
import ProdutoCard from '@/components/ProdutoCard';
import ToyBoxArt from '@/components/ToyBoxArt';
import Loader from '@/components/Loader';
import Modal from '@/components/modal';

type Ordem = 'nome' | 'menor' | 'maior';

export default function ProdutosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<Ordem>('nome');
  const [loading, setLoading] = useState(true);
  const [excluir, setExcluir] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // espera o usuário parar de digitar antes de buscar
  useEffect(() => {
    const t = setTimeout(() => setBusca(filtro.trim()), 300);
    return () => clearTimeout(t);
  }, [filtro]);

  const loadProdutos = async () => {
    try {
      const data = await produtosApi.listar(busca || undefined);
      setProdutos(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  const categorias = useMemo(() => {
    const mapa = new Map<string, number>();
    produtos.forEach((p) => {
      const c = p.categoria || 'Sem categoria';
      mapa.set(c, (mapa.get(c) || 0) + 1);
    });
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [produtos]);

  const visiveis = useMemo(() => {
    const lista = categoria ? produtos.filter((p) => (p.categoria || 'Sem categoria') === categoria) : [...produtos];
    if (ordem === 'menor') lista.sort((a, b) => a.preco_unitario - b.preco_unitario);
    else if (ordem === 'maior') lista.sort((a, b) => b.preco_unitario - a.preco_unitario);
    else lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    return lista;
  }, [produtos, categoria, ordem]);

  const confirmarExclusao = async () => {
    if (!excluir) return;
    setExcluindo(true);
    try {
      await produtosApi.deletar(excluir.id_produto);
      toast.success('Produto excluído.');
      setExcluir(null);
      loadProdutos();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setExcluindo(false);
    }
  };

  const primeiroNome = user?.nome.split(' ')[0];

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(800px 420px at 20% 80%, rgba(255,51,68,.32), transparent 65%), radial-gradient(700px 500px at 90% 0%, rgba(94,10,16,.95), transparent 70%), linear-gradient(170deg, #2a0407, #0e0a0a 75%)',
        }}
      >
        <div className="max-w-[1240px] mx-auto px-5 pt-12 pb-20 lg:pt-16 lg:pb-24 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div className="relative z-[1] rise">
            <p className="eyebrow mb-4">Olá, {primeiroNome} · O turno começou</p>
            <h1 className="display text-[clamp(2.8rem,7vw,5.6rem)] text-[var(--paper)] text-shadow-ink">
              A fábrica de <br />
              brinquedos <span className="flicker">reabriu</span>
            </h1>
            <p className="mt-5 text-lg text-cream/85 max-w-md leading-relaxed">
              Pelúcias, blocos, carrinhos e tudo que saiu da linha de montagem. Escolha o seu antes que as luzes apaguem.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#catalogo" className="btn btn-primary text-lg">
                Ver brinquedos <FaArrowDown />
              </a>
              {user?.perfil === 'gerente' ? (
                <Link href="/admin/produtos" className="btn btn-ghost text-lg">
                  <FaPlus /> Novo produto
                </Link>
              ) : (
                <Link href="/compras" className="btn btn-ghost text-lg">
                  Minhas compras
                </Link>
              )}
            </div>

            <dl className="mt-10 flex gap-8">
              {[
                { n: produtos.length, l: 'brinquedos' },
                { n: categorias.length, l: 'categorias' },
                { n: produtos.filter((p) => p.estoque > 0).length, l: 'à pronta entrega' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="sr-only">{s.l}</dt>
                  <dd className="display text-4xl text-[var(--hazard)] text-shadow-ink">{loading ? '–' : s.n}</dd>
                  <dd className="mono text-[0.7rem] tracking-[0.16em] uppercase text-[var(--muted)]">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ToyBoxArt className="w-full max-w-[460px] mx-auto lg:ml-auto" />
        </div>
        <div className="tear absolute bottom-0 left-0" />
      </section>

      {/* ---------- CATÁLOGO ---------- */}
      <section id="catalogo" className="bg-[var(--paper)] text-[var(--ink)] scroll-mt-28" style={{ backgroundImage: 'var(--grain)' }}>
        <div className="max-w-[1240px] mx-auto px-5 pt-8 pb-16">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
            <div>
              <p className="mono text-xs tracking-[0.2em] uppercase text-[var(--red)]">Linha de montagem</p>
              <h2 className="display text-[clamp(2rem,4vw,3rem)]">Todos os brinquedos</h2>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <label className="input-icon block flex-1 sm:w-72">
                <FaSearch />
                <input
                  type="search"
                  className="input"
                  placeholder="Procurar brinquedo..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  aria-label="Buscar produto"
                />
              </label>
              <select className="input !w-auto" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} aria-label="Ordenar">
                <option value="nome">A–Z</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
              </select>
            </div>
          </div>

          {categorias.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-6 -mx-1 px-1" role="group" aria-label="Filtrar por categoria">
              {[['Todos', produtos.length] as [string, number], ...categorias].map(([c, n]) => {
                const ativo = c === 'Todos' ? categoria === null : categoria === c;
                return (
                  <button
                    key={c}
                    className="chip !border-[var(--ink)] !text-[var(--ink)] aria-pressed:!bg-[var(--ink)] aria-pressed:!text-[var(--hazard)]"
                    aria-pressed={ativo}
                    onClick={() => setCategoria(c === 'Todos' ? null : c)}
                  >
                    {c} <span className="count">{n}</span>
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <Loader label="Buscando nas prateleiras..." dark />
          ) : visiveis.length === 0 ? (
            <div className="empty">
              <ToyBoxArt className="w-40 mx-auto" />
              <p className="display">Nada por aqui...</p>
              <p>{busca ? `Nenhum brinquedo encontrado para "${busca}".` : 'Nenhum produto cadastrado ainda.'}</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visiveis.map((produto, i) => (
                <ProdutoCard
                  key={produto.id_produto}
                  produto={produto}
                  style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
                  onEdit={(id) => router.push(`/admin/produtos?editar=${id}`)}
                  onDelete={() => setExcluir(produto)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <div className="tear tear-flip" />

      <Modal
        isOpen={!!excluir}
        onClose={() => setExcluir(null)}
        title="Excluir produto"
        onConfirm={confirmarExclusao}
        confirmText="Excluir"
        danger
        loading={excluindo}
      >
        <p>
          Tem certeza que deseja excluir <strong>{excluir?.nome}</strong>? Essa ação não pode ser desfeita.
        </p>
      </Modal>
    </>
  );
}
