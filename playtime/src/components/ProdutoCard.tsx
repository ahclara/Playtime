'use client';

import { Produto } from '@/types';
import { FaCartPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { addToCart } from '@/lib/cart';
import { formatBRL } from '@/lib/format';
import ToyArt from './ToyArt';

interface Props {
  produto: Produto;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  style?: React.CSSProperties;
}

const DIAS_NOVO = 30;

export default function ProdutoCard({ produto, onDelete, onEdit, style }: Props) {
  const { user } = useAuth();
  const esgotado = produto.estoque <= 0;
  const ultimas = !esgotado && produto.estoque <= 5;
  const novo =
    !!produto.data_cadastro && Date.now() - new Date(produto.data_cadastro).getTime() < DIAS_NOVO * 24 * 60 * 60 * 1000;

  const adicionarAoCarrinho = () => {
    const erro = addToCart(produto);
    if (erro) toast.error(erro);
    else toast.success(`${produto.nome} foi pra sua caixa!`);
  };

  return (
    <article className="paper toy-card rise" style={style}>
      <ToyArt categoria={produto.categoria} nome={produto.nome} id={produto.id_produto}>
        <div className="absolute top-3 left-3 z-[2] flex flex-col gap-1.5 items-start">
          {novo && <span className="badge badge-ink">Novo</span>}
          {ultimas && <span className="badge" style={{ background: 'var(--hazard)', color: 'var(--ink)', borderColor: 'var(--ink)' }}>Últimas {produto.estoque}</span>}
        </div>
        {esgotado && (
          <div className="absolute inset-0 z-[2] grid place-items-center bg-[rgba(14,10,10,.45)]">
            <span className="stamp text-2xl">Esgotado</span>
          </div>
        )}
      </ToyArt>

      <div className="flex-1 flex flex-col p-4 pt-3">
        <p className="mono text-[0.72rem] tracking-[0.16em] uppercase text-[#7d6b62]">{produto.categoria || 'Sem categoria'}</p>
        <h3 className="display text-[1.35rem] mt-1 leading-[1.05] text-[var(--ink)]">{produto.nome}</h3>
        {produto.descricao && <p className="text-sm text-[#5b4d46] mt-1.5 line-clamp-2">{produto.descricao}</p>}

        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          <div>
            <p className="display text-[1.7rem] leading-none text-[var(--red)]">
              {formatBRL(produto.preco_unitario)}
            </p>
            <p className="mono text-[0.7rem] tracking-[0.12em] uppercase text-[#7d6b62] mt-1">
              {esgotado ? 'Sem estoque' : `${produto.estoque} em estoque`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={adicionarAoCarrinho} disabled={esgotado} className="btn btn-primary btn-sm flex-1">
            <FaCartPlus /> {esgotado ? 'Esgotado' : 'Comprar'}
          </button>
          {user?.perfil === 'gerente' && (
            <>
              <button onClick={() => onEdit?.(produto.id_produto)} className="btn btn-hazard btn-xs" title="Editar" aria-label="Editar produto">
                <FaEdit />
              </button>
              <button onClick={() => onDelete?.(produto.id_produto)} className="btn btn-danger btn-xs" title="Excluir" aria-label="Excluir produto">
                <FaTrash />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
