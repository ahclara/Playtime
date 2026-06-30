from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor

class ListarVendasPorPeriodoUseCase:
    """Caso de Uso: Listar Vendas por Período"""
    
    def executar(self, data_inicio, data_fim):
        """Executa a listagem de vendas por período"""
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT v.*, c.nome as nome_cliente
            FROM vendas v
            JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE v.data_venda BETWEEN %s AND %s
                AND v.status = 'pago' 
            ORDER BY v.data_venda DESC
        """, (data_inicio, data_fim))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows