from database.Conexao import get_connection
from models.Cancelamento import Cancelamento
from psycopg2.extras import RealDictCursor

class CancelamentoRepository:
    """Repository para Cancelamento"""
    
    @staticmethod
    def criar(cancelamento):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cancelamentos (id_venda, id_cliente, motivo)
            VALUES (%s, %s, %s)
            RETURNING id_cancelamento
        """, (cancelamento.id_venda, cancelamento.id_cliente, cancelamento.motivo))
        id_cancelamento = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        cancelamento.id_cancelamento = id_cancelamento
        return cancelamento
    
    @staticmethod
    def buscar_por_venda(id_venda):
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM cancelamentos WHERE id_venda = %s", (id_venda,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return Cancelamento(
                id_cancelamento=row['id_cancelamento'],
                id_venda=row['id_venda'],
                id_cliente=row['id_cliente'],
                motivo=row['motivo']
            )
        return None
    
    @staticmethod
    def listar_todos():
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM cancelamentos ORDER BY data_cancelamento DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [Cancelamento(
            id_cancelamento=row['id_cancelamento'],
            id_venda=row['id_venda'],
            id_cliente=row['id_cliente'],
            motivo=row['motivo']
        ) for row in rows]