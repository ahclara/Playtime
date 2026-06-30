import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_UK4ZYhbQN6Tf@ep-morning-sky-ac16o3dj.sa-east-1.aws.neon.tech/neondb?sslmode=require")

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    """Inicializa todas as tabelas do banco de dados"""
    conn = get_connection()
    cur = conn.cursor()
    
    # 1. Tabela: clientes
    cur.execute("""
        CREATE TABLE IF NOT EXISTS clientes (
            id_cliente SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            cpf VARCHAR(14) UNIQUE NOT NULL,
            email VARCHAR(100) NOT NULL,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 2. Tabela: produtos
    cur.execute("""
        CREATE TABLE IF NOT EXISTS produtos (
            id_produto SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            descricao TEXT,
            preco_unitario DECIMAL(10,2) NOT NULL,
            estoque INTEGER NOT NULL DEFAULT 0,
            categoria VARCHAR(50),
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 3. Tabela: vendas
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vendas (
            id_venda SERIAL PRIMARY KEY,
            id_cliente INTEGER REFERENCES clientes(id_cliente),
            data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pendente',
            metodo_pagamento VARCHAR(30),
            id_transacao_pagamento VARCHAR(100)
        )
    """)
    
    # 4. Tabela: itens_venda
    cur.execute("""
        CREATE TABLE IF NOT EXISTS itens_venda (
            id_item SERIAL PRIMARY KEY,
            id_venda INTEGER REFERENCES vendas(id_venda) ON DELETE CASCADE,
            id_produto INTEGER REFERENCES produtos(id_produto),
            quantidade INTEGER NOT NULL,
            preco_unitario DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL
        )
    """)
    
    # 5. Tabela: cancelamentos
    cur.execute("""
        CREATE TABLE IF NOT EXISTS cancelamentos (
            id_cancelamento SERIAL PRIMARY KEY,
            id_venda INTEGER REFERENCES vendas(id_venda),
            id_cliente INTEGER REFERENCES clientes(id_cliente),
            motivo VARCHAR(200),
            data_cancelamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 6. Tabela: usuarios (para autenticação JWT)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario SERIAL PRIMARY KEY,
            id_cliente INTEGER REFERENCES clientes(id_cliente),
            email VARCHAR(100) UNIQUE NOT NULL,
            senha_hash VARCHAR(255) NOT NULL,
            perfil VARCHAR(20) DEFAULT 'cliente',
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 7. Tabela: permissoes (RBAC)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS permissoes (
            id_permissao SERIAL PRIMARY KEY,
            perfil VARCHAR(20) UNIQUE NOT NULL,
            permissoes JSONB
        )
    """)
    
    # Inserir perfis padrão
    cur.execute("""
        INSERT INTO permissoes (perfil, permissoes) VALUES
        ('gerente', '["gerenciar_produtos", "atualizar_estoque", "gerar_relatorios", "consultar_vendas", "cancelar_vendas", "gerenciar_clientes"]'),
        ('vendedor', '["consultar_produtos", "realizar_vendas", "consultar_vendas", "gerenciar_clientes"]'),
        ('cliente', '["consultar_produtos", "comprar_produtos", "atualizar_perfil"]')
        ON CONFLICT (perfil) DO NOTHING
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    print("Banco de dados inicializado com sucesso!")

def test_connection():
    try:
        conn = get_connection()
        conn.close()
        return True
    except Exception as e:
        print(f"Erro na conexão: {e}")
        return False

if __name__ == "__main__":
    test_connection()
    init_db()