from database.Conexao import get_connection
from models.Venda import Venda
from models.ItemVenda import ItemVenda
from models.Produto import Produto
from repositories.ProdutoRepository import ProdutoRepository
from psycopg2.extras import RealDictCursor

class VendaRepository:
    """Repository para Venda"""
    
    @staticmethod
    def criar(venda):
        conn = get_connection()
        cur = conn.cursor()
        
        # Inserir venda
        cur.execute("""
            INSERT INTO vendas (id_cliente, valor_total, status, metodo_pagamento)
            VALUES (%s, %s, %s, %s)
            RETURNING id_venda
        """, (venda.id_cliente, venda.valor_total, venda.status, venda.metodo_pagamento))
        id_venda = cur.fetchone()[0]
        venda.id_venda = id_venda
        
        # Inserir itens da venda
        for item in venda.itens:
            cur.execute("""
                INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            """, (id_venda, item.produto.id_produto, item.quantidade, item.preco_unitario, item.subtotal))
            
            # Atualizar estoque
            ProdutoRepository.atualizar_estoque(item.produto.id_produto, item.produto.estoque - item.quantidade)
        
        conn.commit()
        cur.close()
        conn.close()
        return venda
    
    @staticmethod
    def buscar_por_id(id_venda):
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Buscar venda
        cur.execute("SELECT * FROM vendas WHERE id_venda = %s", (id_venda,))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return None
        
        # Buscar itens da venda
        cur.execute("""
            SELECT iv.*, p.nome as nome_produto 
            FROM itens_venda iv
            JOIN produtos p ON iv.id_produto = p.id_produto
            WHERE iv.id_venda = %s
        """, (id_venda,))
        itens_rows = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Construir objetos ItemVenda
        itens = []
        for item_row in itens_rows:
            produto = Produto(
                id_produto=item_row['id_produto'],
                nome=item_row['nome_produto'],
                preco_unitario=item_row['preco_unitario']
            )
            item = ItemVenda(
                produto=produto,
                quantidade=item_row['quantidade'],
                id_item=item_row['id_item'],
                preco_unitario=item_row['preco_unitario']
            )
            itens.append(item)
        
        venda = Venda(
            id_venda=row['id_venda'],
            id_cliente=row['id_cliente'],
            itens=itens,
            data_venda=row['data_venda'],
            status=row['status'],
            metodo_pagamento=row.get('metodo_pagamento')
        )
        venda.valor_total = row['valor_total']
        return venda
    
    @staticmethod
    def listar_todos():
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM vendas ORDER BY data_venda DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        vendas = []
        for row in rows:
            venda = Venda(
                id_venda=row['id_venda'],
                id_cliente=row['id_cliente'],
                data_venda=row['data_venda'],
                status=row['status'],
                metodo_pagamento=row.get('metodo_pagamento')
            )
            venda.valor_total = row['valor_total']
            vendas.append(venda)
        return vendas
    
    @staticmethod
    def listar_por_cliente(id_cliente):
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM vendas WHERE id_cliente = %s ORDER BY data_venda DESC", (id_cliente,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        vendas = []
        for row in rows:
            venda = Venda(
                id_venda=row['id_venda'],
                id_cliente=row['id_cliente'],
                data_venda=row['data_venda'],
                status=row['status'],
                metodo_pagamento=row.get('metodo_pagamento')
            )
            venda.valor_total = row['valor_total']
            vendas.append(venda)
        return vendas
    
    @staticmethod
    def listar_por_periodo(data_inicio, data_fim):
        """Listar vendas por período"""
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT v.*, c.nome as nome_cliente
            FROM vendas v
            JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE v.data_venda BETWEEN %s AND %s
            ORDER BY v.data_venda DESC
        """, (data_inicio, data_fim))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        vendas = []
        for row in rows:
            venda = Venda(
                id_venda=row['id_venda'],
                id_cliente=row['id_cliente'],
                data_venda=row['data_venda'],
                status=row['status'],
                metodo_pagamento=row.get('metodo_pagamento')
            )
            venda.valor_total = row['valor_total']
            venda.nome_cliente = row['nome_cliente']
            vendas.append(venda)
        return vendas
    
    @staticmethod
    def atualizar_status(id_venda, novo_status):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE vendas SET status = %s WHERE id_venda = %s
            RETURNING status
        """, (novo_status, id_venda))
        status_atualizado = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return status_atualizado
    
    @staticmethod
    def contar_concluidas():
        """Conta vendas com status 'pago'"""
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM vendas WHERE status = 'pago'")
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return count

    @staticmethod
    def somar_total_arrecadado():
        """Soma o total arrecadado das vendas com status 'pago'"""
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COALESCE(SUM(valor_total), 0) FROM vendas WHERE status = 'pago'")
        total = cur.fetchone()[0]
        cur.close()
        conn.close()
        return float(total)