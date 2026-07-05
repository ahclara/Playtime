'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { produtosApi } from '@/services/api';
import { Produto } from '@/types';
import { FaSearch, FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

const styles = {
  container: {
    padding: '2rem 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    marginBottom: '2rem',
  },
  titulo: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  barraBusca: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0 1rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  inputBusca: {
    border: 'none',
    background: 'transparent',
    padding: '0.6rem 0',
    fontSize: '0.9rem',
    outline: 'none',
    width: '200px',
  },
  btnNovo: {
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'background-color 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.2rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s, transform 0.2s',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardHover: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    transform: 'translateY(-2px)',
  },
  nomeProduto: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1a1a2e',
  },
  categoria: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  preco: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0.5rem 0',
  },
  estoque: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '0.8rem',
  },
  acoes: {
    display: 'flex',
    gap: '0.4rem',
    marginTop: 'auto',
  },
  btnComprar: {
    flex: 1,
    padding: '0.5rem 0',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    transition: 'background-color 0.2s',
  },
  btnEditar: {
    padding: '0.5rem 0.8rem',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  btnExcluir: {
    padding: '0.5rem 0.8rem',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
  },
  empty: {
    textAlign: 'center' as const,
    color: '#6b7280',
    padding: '3rem 0',
    gridColumn: '1 / -1',
  },
};

export default function ProdutosPage() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProdutos = async () => {
    try {
      const data = await produtosApi.listar(filtro || undefined);
      setProdutos(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, [filtro]);

  const adicionarAoCarrinho = (produto: Produto) => {
    if (produto.estoque <= 0) {
      toast.error('Produto sem estoque.');
      return;
    }
    const cart = JSON.parse(localStorage.getItem('carrinho') || '[]');
    const existing = cart.find((item: any) => item.id_produto === produto.id_produto);
    if (existing) {
      if (existing.quantidade >= produto.estoque) {
        toast.error('Quantidade máxima atingida.');
        return;
      }
      existing.quantidade++;
    } else {
      cart.push({
        id_produto: produto.id_produto,
        nome: produto.nome,
        preco_unitario: produto.preco_unitario,
        quantidade: 1,
        estoque: produto.estoque,
      });
    }
    localStorage.setItem('carrinho', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    toast.success(`${produto.nome} adicionado ao carrinho.`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.titulo}>Produtos</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={styles.barraBusca}>
            <FaSearch style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={styles.inputBusca}
            />
          </div>
          {user?.perfil === 'gerente' && (
            <Link href="/admin/produtos" style={styles.btnNovo}>
              <FaPlus /> Novo Produto
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div style={styles.empty}>Carregando produtos...</div>
      ) : produtos.length === 0 ? (
        <div style={styles.empty}>Nenhum produto encontrado.</div>
      ) : (
        <div style={styles.grid}>
          {produtos.map((produto) => (
            <div
              key={produto.id_produto}
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.nomeProduto}>{produto.nome}</div>
              <div style={styles.categoria}>{produto.categoria || 'Sem categoria'}</div>
              <div style={styles.preco}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco_unitario)}
              </div>
              <div style={styles.estoque}>Estoque: {produto.estoque}</div>
              <div style={styles.acoes}>
                <button
                  onClick={() => adicionarAoCarrinho(produto)}
                  style={styles.btnComprar}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
                >
                  <FaPlus /> Comprar
                </button>
                {user?.perfil === 'gerente' && (
                  <>
                    <button style={styles.btnEditar}>Editar</button>
                    <button style={styles.btnExcluir}>X</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}