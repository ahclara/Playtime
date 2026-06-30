from flask import Blueprint, request, jsonify
from middleware.auth import token_required, role_required
from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor
from models.Produto import Produto
from instances import sistema 

produto_bp = Blueprint('produtos', __name__)

# --------- CONSULTAR PRODUTOS ---------

@produto_bp.route('/produtos', methods=['GET'])
@token_required
@role_required(['consultar_produtos'])
def listar_produtos(current_user):
    """Listar todos os produtos"""
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM produtos ORDER BY id_produto")
        produtos_data = cur.fetchall()
        cur.close()
        conn.close()
        
        # Converter para o formato esperado
        produtos = []
        for row in produtos_data:
            produto = Produto(
                id_produto=row['id_produto'],
                nome=row['nome'],
                preco_unitario=row['preco_unitario'],
                estoque=row['estoque']
            )
            produtos.append(produto.to_dict())
        
        return jsonify(produtos), 200
    except Exception as e:
        print(f"Erro ao listar produtos: {e}")
        return jsonify({'erro': str(e)}), 500

# --------- BUSCAR PRODUTO POR ID ---------

@produto_bp.route('/produtos/<int:id_produto>', methods=['GET'])
@token_required
@role_required(['consultar_produtos'])
def buscar_produto(current_user, id_produto):
    """Buscar produto por ID"""
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM produtos WHERE id_produto = %s", (id_produto,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        
        produto = Produto(
            id_produto=row['id_produto'],
            nome=row['nome'],
            preco_unitario=row['preco_unitario'],
            estoque=row['estoque']
        )
        return jsonify(produto.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- CRIAR PRODUTO ---------

@produto_bp.route('/produtos', methods=['POST'])
@token_required
@role_required(['gerenciar_produtos'])
def criar_produto(current_user):
    """Criar produto"""
    try:
        dados = request.get_json()
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO produtos (nome, preco_unitario, estoque)
            VALUES (%s, %s, %s)
            RETURNING id_produto
        """, (dados['nome'], dados['preco_unitario'], dados.get('estoque', 0)))
        
        id_produto = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        # Buscar o produto criado
        conn2 = get_connection()
        cur2 = conn2.cursor(cursor_factory=RealDictCursor)
        cur2.execute("SELECT * FROM produtos WHERE id_produto = %s", (id_produto,))
        row = cur2.fetchone()
        cur2.close()
        conn2.close()
        
        produto = Produto(
            id_produto=row['id_produto'],
            nome=row['nome'],
            preco_unitario=row['preco_unitario'],
            estoque=row['estoque']
        )
        
        # Atualiza a memória também
        sistema.produtos[id_produto] = produto
        
        return jsonify(produto.to_dict()), 201
    except KeyError as e:
        return jsonify({'erro': f'Campo obrigatório: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- ATUALIZAR PRODUTO ---------

@produto_bp.route('/produtos/<int:id_produto>', methods=['PUT'])
@token_required
@role_required(['gerenciar_produtos'])
def atualizar_produto(current_user, id_produto):
    """Atualizar produto"""
    try:
        dados = request.get_json()
        
        conn = get_connection()
        cur = conn.cursor()
        
        updates = []
        params = []
        
        if 'nome' in dados and dados['nome']:
            updates.append("nome = %s")
            params.append(dados['nome'])
        if 'preco_unitario' in dados and dados['preco_unitario']:
            updates.append("preco_unitario = %s")
            params.append(dados['preco_unitario'])
        if 'estoque' in dados and dados['estoque'] is not None:
            updates.append("estoque = %s")
            params.append(dados['estoque'])
        
        if not updates:
            cur.close()
            conn.close()
            return jsonify({'erro': 'Nenhum campo para atualizar'}), 400
        
        params.append(id_produto)
        query = f"UPDATE produtos SET {', '.join(updates)} WHERE id_produto = %s"
        cur.execute(query, params)
        conn.commit()
        cur.close()
        conn.close()
        
        # Atualiza na memória
        if id_produto in sistema.produtos:
            produto = sistema.produtos[id_produto]
            if 'nome' in dados and dados['nome']:
                produto.nome = dados['nome']
            if 'preco_unitario' in dados and dados['preco_unitario']:
                produto.preco_unitario = dados['preco_unitario']
            if 'estoque' in dados and dados['estoque'] is not None:
                produto.estoque = dados['estoque']
        
        return jsonify({'mensagem': 'Produto atualizado com sucesso!'}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- ATUALIZAR ESTOQUE ---------

@produto_bp.route('/produtos/<int:id_produto>/estoque', methods=['PATCH'])
@token_required
@role_required(['atualizar_estoque'])
def atualizar_estoque(current_user, id_produto):
    """Atualizar estoque"""
    try:
        dados = request.get_json()
        quantidade = dados.get('quantidade', 0)
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("UPDATE produtos SET estoque = estoque + %s WHERE id_produto = %s RETURNING estoque", 
                   (quantidade, id_produto))
        novo_estoque = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        # Atualiza na memória
        if id_produto in sistema.produtos:
            sistema.produtos[id_produto].estoque = novo_estoque
        
        return jsonify({
            'mensagem': 'Estoque atualizado com sucesso!',
            'estoque_atual': novo_estoque
        }), 200
    except ValueError:
        return jsonify({'erro': 'Valor inválido'}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- DELETAR PRODUTO ---------

@produto_bp.route('/produtos/<int:id_produto>', methods=['DELETE'])
@token_required
@role_required(['gerenciar_produtos'])
def deletar_produto(current_user, id_produto):
    """Deletar produto"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("DELETE FROM produtos WHERE id_produto = %s", (id_produto,))
        conn.commit()
        cur.close()
        conn.close()
        
        # Remove da memória
        if id_produto in sistema.produtos:
            del sistema.produtos[id_produto]
        
        return jsonify({'mensagem': 'Produto deletado com sucesso!'}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500