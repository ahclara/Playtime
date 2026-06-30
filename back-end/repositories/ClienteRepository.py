from database.Conexao import get_connection
from models.Cliente import Cliente
from psycopg2.extras import RealDictCursor

class ClienteRepository:
    """Repository para Cliente"""
    
    @staticmethod
    def criar(cliente):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO clientes (nome, cpf, email)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_cliente
        """, (cliente.nome, cliente.cpf, cliente.email))
        id_cliente = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        cliente.id_cliente = id_cliente
        return cliente
    
    @staticmethod
    def buscar_por_id(id_cliente):
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM clientes WHERE id_cliente = %s", (id_cliente,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return Cliente(
                id_cliente=row['id_cliente'],
                nome=row['nome'],
                cpf=row['cpf'],
                email=row['email'],
               
            )
        return None
    
    @staticmethod
    def buscar_por_cpf(cpf):
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM clientes WHERE cpf = %s", (cpf,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return Cliente(
                id_cliente=row['id_cliente'],
                nome=row['nome'],
                cpf=row['cpf'],
                email=row['email'],
            
            )
        return None
    
    @staticmethod
    def buscar_por_email(email):
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM clientes WHERE email = %s", (email,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return Cliente(
                id_cliente=row['id_cliente'],
                nome=row['nome'],
                cpf=row['cpf'],
                email=row['email'],
            
            )
        return None
    
    @staticmethod
    def listar_todos():
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM clientes ORDER BY id_cliente")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [Cliente(
            id_cliente=row['id_cliente'],
            nome=row['nome'],
            cpf=row['cpf'],
            email=row['email'],
        ) for row in rows]
    
    @staticmethod
    def atualizar(cliente):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE clientes 
            SET nome = %s, email = %s
            WHERE id_cliente = %s
        """, (cliente.nome, cliente.email, cliente.id_cliente))
        conn.commit()
        cur.close()
        conn.close()
        return cliente
    
    @staticmethod
    def deletar(id_cliente):
        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM clientes WHERE id_cliente = %s", (id_cliente,))
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
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM clientes")
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return count