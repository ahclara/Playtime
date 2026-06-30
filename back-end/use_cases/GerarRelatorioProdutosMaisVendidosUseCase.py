from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor

class GerarRelatorioProdutosMaisVendidosUseCase:
    """Caso de Uso: Gerar Relatório de Produtos Mais Vendidos"""
    
    def executar(self, data_inicio, data_fim):
        """Gera relatório de produtos mais vendidos no período"""
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT 
                p.id_produto,
                p.nome,
                p.categoria,
                SUM(iv.quantidade) as total_vendido,
                SUM(iv.subtotal) as total_receita,
                COUNT(DISTINCT iv.id_venda) as numero_vendas
            FROM itens_venda iv
            JOIN produtos p ON iv.id_produto = p.id_produto
            JOIN vendas v ON iv.id_venda = v.id_venda
            WHERE v.data_venda BETWEEN %s AND %s
                AND v.status = 'pago' 
            GROUP BY p.id_produto, p.nome, p.categoria
            ORDER BY total_vendido DESC
        """, (data_inicio, data_fim))
        
        resultados = cur.fetchall()
        cur.close()
        conn.close()
        
        return {
            'periodo': {
                'data_inicio': data_inicio,
                'data_fim': data_fim
            },
            'produtos_mais_vendidos': resultados,
            'total_produtos': len(resultados)
        }