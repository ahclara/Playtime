from database.Conexao import get_connection
from models.Produto import Produto
from psycopg2.extras import RealDictCursor

class ProdutoRepository:
    """Repository para Produto"""
    
    @staticmethod
    def criar(produto):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO produtos (nome, descricao, preco_unitario, estoque, categoria)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_produto
        """, (produto.nome, produto.descricao, produto.preco_unitario, produto.estoque, produto.categoria))
        id_produto = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        produto.id_produto = id_produto
        return produto
    
    @staticmethod
    def buscar_por_id(id_produto):
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM produtos WHERE id_produto = %s", (id_produto,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return Produto(
                id_produto=row['id_produto'],
                nome=row['nome'],
                descricao=row.get('descricao'),
                preco_unitario=row['preco_unitario'],
                estoque=row['estoque'],
                categoria=row.get('categoria')
            )
        return None
    
    @staticmethod
    def listar_todos(filtro=None):
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        query = "SELECT * FROM produtos"
        params = []
        if filtro:
            query += " WHERE nome ILIKE %s OR categoria ILIKE %s"
            params = [f"%{filtro}%", f"%{filtro}%"]
        query += " ORDER BY id_produto"
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [Produto(
            id_produto=row['id_produto'],
            nome=row['nome'],
            descricao=row.get('descricao'),
            preco_unitario=row['preco_unitario'],
            estoque=row['estoque'],
            categoria=row.get('categoria')
        ) for row in rows]
    
    @staticmethod
    def atualizar(produto):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE produtos 
            SET nome = %s, descricao = %s, preco_unitario = %s, categoria = %s
            WHERE id_produto = %s
        """, (produto.nome, produto.descricao, produto.preco_unitario, produto.categoria, produto.id_produto))
        conn.commit()
        cur.close()
        conn.close()
        return produto
    
    @staticmethod
    def atualizar_estoque(id_produto, nova_quantidade):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE produtos SET estoque = %s WHERE id_produto = %s
            RETURNING estoque
        """, (nova_quantidade, id_produto))
        estoque_atualizado = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return estoque_atualizado
    
    @staticmethod
    def deletar(id_produto):
        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM produtos WHERE id_produto = %s", (id_produto,))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            return False
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def contar():
        """Conta quantos produtos existem"""
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM produtos")
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return count