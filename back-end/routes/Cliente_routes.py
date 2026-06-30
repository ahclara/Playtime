from flask import Blueprint, request, jsonify
from middleware.auth import token_required, role_required
from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor
from instances import sistema 

cliente_bp = Blueprint('clientes', __name__)

# --------- LISTAR CLIENTES ---------

@cliente_bp.route('/clientes', methods=['GET'])
@token_required
@role_required(['gerenciar_clientes'])
def listar_clientes(current_user):
    """Listar todos os clientes"""
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id_cliente, nome, cpf, email, ativo, data_cadastro FROM clientes ORDER BY id_cliente")
        clientes = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(clientes), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- BUSCAR CLIENTE POR ID ---------

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['GET'])
@token_required
def buscar_cliente(current_user, id_cliente):
    """Buscar um cliente por ID"""
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id_cliente, nome, cpf, email, ativo, data_cadastro FROM clientes WHERE id_cliente = %s", (id_cliente,))
        cliente = cur.fetchone()
        cur.close()
        conn.close()
        
        if not cliente:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        return jsonify(cliente), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- CRIAR CLIENTE ---------

@cliente_bp.route('/clientes', methods=['POST'])
def criar_cliente():
    """Criar um novo cliente"""
    try:
        dados = request.get_json()
        
        # Valida campos obrigatórios
        if not dados.get('nome') or not dados.get('cpf') or not dados.get('email'):
            return jsonify({'erro': 'Nome, CPF e Email são obrigatórios'}), 400
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Verifica se CPF já existe
        cur.execute("SELECT id_cliente FROM clientes WHERE cpf = %s", (dados['cpf'],))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'erro': 'CPF já cadastrado'}), 400
        
        # Verifica se Email já existe
        cur.execute("SELECT id_cliente FROM clientes WHERE email = %s", (dados['email'],))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'erro': 'Email já cadastrado'}), 400
        
        # Inserir cliente
        cur.execute("""
            INSERT INTO clientes (nome, cpf, email, ativo)
            VALUES (%s, %s, %s, true)
            RETURNING id_cliente, nome, cpf, email, ativo, data_cadastro
        """, (dados['nome'], dados['cpf'], dados['email']))
        
        cliente = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'id_cliente': cliente[0],
            'nome': cliente[1],
            'cpf': cliente[2],
            'email': cliente[3],
            'ativo': cliente[4],
            'data_cadastro': cliente[5]
        }), 201
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- ATUALIZAR CLIENTE ---------

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['PUT'])
@token_required
@role_required(['gerenciar_clientes'])
def atualizar_cliente(current_user, id_cliente):
    """Atualizar um cliente existente"""
    try:
        dados = request.get_json()
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Verifica se o cliente existe
        cur.execute("SELECT id_cliente, nome, email, cpf FROM clientes WHERE id_cliente = %s AND ativo = true", (id_cliente,))
        cliente = cur.fetchone()
        
        if not cliente:
            cur.close()
            conn.close()
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        # Construir query dinâmica para clientes
        updates = []
        params = []
        nome_atualizado = None
        email_atualizado = None
        cpf_atualizado = None
        
        if 'nome' in dados and dados['nome']:
            updates.append("nome = %s")
            params.append(dados['nome'])
            nome_atualizado = dados['nome']
        
        if 'email' in dados and dados['email']:
            # Verifica se email já existe em outro cliente
            cur.execute("SELECT id_cliente FROM clientes WHERE email = %s AND id_cliente != %s", (dados['email'], id_cliente))
            if cur.fetchone():
                cur.close()
                conn.close()
                return jsonify({'erro': 'Email já cadastrado para outro cliente'}), 400
            updates.append("email = %s")
            params.append(dados['email'])
            email_atualizado = dados['email']
        
        if 'cpf' in dados and dados['cpf']:
            # Verifica se CPF já existe em outro cliente
            cur.execute("SELECT id_cliente FROM clientes WHERE cpf = %s AND id_cliente != %s", (dados['cpf'], id_cliente))
            if cur.fetchone():
                cur.close()
                conn.close()
                return jsonify({'erro': 'CPF já cadastrado para outro cliente'}), 400
            updates.append("cpf = %s")
            params.append(dados['cpf'])
            cpf_atualizado = dados['cpf']
        
        if not updates:
            cur.close()
            conn.close()
            return jsonify({'erro': 'Nenhum campo para atualizar'}), 400
        
        # Atualizar Cliente
        params.append(id_cliente)
        query = f"UPDATE clientes SET {', '.join(updates)} WHERE id_cliente = %s RETURNING id_cliente, nome, email, cpf"
        cur.execute(query, params)
        cliente_atualizado = cur.fetchone()
        
        # Atualizar Tabela usuarios
        if nome_atualizado or email_atualizado:
            updates_usuario = []
            params_usuario = []
            
            if nome_atualizado:
                updates_usuario.append("nome = %s")
                params_usuario.append(nome_atualizado)
                print(f"Nome atualizado na tabela usuarios: {nome_atualizado}")
            
            if email_atualizado:
                updates_usuario.append("email = %s")
                params_usuario.append(email_atualizado)
                print(f"Email atualizado na tabela usuarios: {email_atualizado}")
            
            params_usuario.append(id_cliente)
            query_usuario = f"UPDATE usuarios SET {', '.join(updates_usuario)} WHERE id_cliente = %s"
            cur.execute(query_usuario, params_usuario)
            print(f"Usuario {id_cliente} atualizado!")
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Atualizar na memória
        cliente_obj = sistema.buscar_cliente(id_cliente)
        if cliente_obj:
            if 'nome' in dados and dados['nome']:
                cliente_obj.nome = dados['nome']
            if 'email' in dados and dados['email']:
                cliente_obj.email = dados['email']
            if 'cpf' in dados and dados['cpf']:
                cliente_obj.cpf = dados['cpf']
        
        # Atualizar na lista de usuarios
        for usuario in sistema.usuarios.values():
            if usuario.id_cliente == id_cliente:
                if nome_atualizado:
                    usuario.nome = nome_atualizado
                if email_atualizado:
                    usuario.email = email_atualizado
                break
        
        return jsonify({
            'id_cliente': cliente_atualizado[0],
            'nome': cliente_atualizado[1],
            'email': cliente_atualizado[2],
            'cpf': cliente_atualizado[3],
            'mensagem': 'Cliente e usuário atualizados com sucesso!'
        }), 200
        
    except Exception as e:
        print(f"Erro ao atualizar cliente: {e}")
        return jsonify({'erro': str(e)}), 500
    
# --------- DELETAR CLIENTE ---------

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['DELETE'])
@token_required
@role_required(['gerenciar_clientes'])
def deletar_cliente(current_user, id_cliente):
    """Deletar um cliente"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Verifica se o cliente existe
        cur.execute("SELECT id_cliente FROM clientes WHERE id_cliente = %s", (id_cliente,))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        # Verifica se o cliente tem vendas associadas
        cur.execute("SELECT COUNT(*) FROM vendas WHERE id_cliente = %s", (id_cliente,))
        total_vendas = cur.fetchone()[0]
        
        if total_vendas > 0:
            cur.close()
            conn.close()
            return jsonify({
                'erro': f'Cliente possui {total_vendas} venda(s) associada(s). Não pode ser deletado.'
            }), 400
        
        # Deleta usuário associado
        cur.execute("DELETE FROM usuarios WHERE id_cliente = %s", (id_cliente,))
        
        # Deleta cliente
        cur.execute("DELETE FROM clientes WHERE id_cliente = %s", (id_cliente,))
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'mensagem': f'Cliente {id_cliente} e seu usuário deletados!'
        }), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500