import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_UK4ZYhbQN6Tf@ep-morning-sky-ac16o3dj.sa-east-1.aws.neon.tech/neondb?sslmode=require"

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS clientes (
            id_cliente SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            cpf VARCHAR(14) UNIQUE NOT NULL,
            email VARCHAR(100) NOT NULL
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS produtos (
            id_produto SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            preco_unitario DECIMAL(10,2) NOT NULL,
            estoque INTEGER NOT NULL DEFAULT 0
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vendas (
            id_venda SERIAL PRIMARY KEY,
            id_cliente INTEGER REFERENCES clientes(id_cliente),
            data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            valor_total DECIMAL(10,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pendente',
            id_transacao_pagamento VARCHAR(100)
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS itens_venda (
            id_item SERIAL PRIMARY KEY,
            id_venda INTEGER REFERENCES vendas(id_venda),
            id_produto INTEGER REFERENCES produtos(id_produto),
            quantidade INTEGER NOT NULL,
            preco_unitario DECIMAL(10,2) NOT NULL
        )
    """)
    
    conn.commit()
    cur.close()
    conn.close()

def test_connection():
    try:
        conn = get_connection()
        conn.close()
        return True
    except Exception as e:
        print(f"Erro na conexao: {e}")
        return False

if __name__ == "__main__":
    test_connection()
    init_db()