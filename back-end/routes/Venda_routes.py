from flask import Blueprint, request, jsonify
from middleware.auth import token_required, role_required
from instances import sistema
from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor

venda_bp = Blueprint('vendas', __name__)

# --------- LISTAR VENDAS ---------

@venda_bp.route('/vendas', methods=['GET'])
@token_required
@role_required(['consultar_vendas'])
def listar_vendas(current_user):
    """Listar todas as vendas"""
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Busca todas as vendas com dados do cliente
        cur.execute("""
            SELECT v.*, c.nome as nome_cliente, c.email as email_cliente
            FROM vendas v
            JOIN clientes c ON v.id_cliente = c.id_cliente
            ORDER BY v.data_venda DESC
        """)
        vendas = cur.fetchall()
        cur.close()
        conn.close()
        
        # Para cada venda, buscar os itens
        for venda in vendas:
            conn2 = get_connection()
            cur2 = conn2.cursor(cursor_factory=RealDictCursor)
            cur2.execute("""
                SELECT iv.*, p.nome as nome_produto
                FROM itens_venda iv
                JOIN produtos p ON iv.id_produto = p.id_produto
                WHERE iv.id_venda = %s
            """, (venda['id_venda'],))
            venda['itens'] = cur2.fetchall()
            cur2.close()
            conn2.close()
        
        return jsonify(vendas), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- COMPRAS DO CLIENTE LOGADO ---------

@venda_bp.route('/compras/cliente', methods=['GET'])
@token_required
def minhas_compras(current_user):
    """Listar compras do cliente logado"""
    try:
        id_cliente = current_user['id_cliente']
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT v.*
            FROM vendas v
            WHERE v.id_cliente = %s
            ORDER BY v.data_venda DESC
        """, (id_cliente,))
        vendas = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify(vendas), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- CLIENTE COMPRAR ---------

@venda_bp.route('/vendas/comprar', methods=['POST'])
@token_required
def comprar_produto(current_user):
    """Cliente compra para si mesmo"""
    try:
        dados = request.get_json()
        id_cliente = current_user['id_cliente']
        
        if not sistema.buscar_cliente(id_cliente):
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        itens = dados.get('itens', [])
        if not itens:
            return jsonify({'erro': 'Venda sem itens'}), 400
        
        # Verifica estoque e calcular total
        conn = get_connection()
        cur = conn.cursor()
        
        valor_total = 0
        itens_validados = []
        
        for item in itens:
            id_produto = item['id_produto']
            quantidade = item['quantidade']
            
            cur.execute("SELECT id_produto, nome, preco_unitario, estoque FROM produtos WHERE id_produto = %s", (id_produto,))
            produto = cur.fetchone()
            
            if not produto:
                cur.close()
                conn.close()
                return jsonify({'erro': f'Produto {id_produto} não encontrado'}), 404
            
            if produto[3] < quantidade:
                cur.close()
                conn.close()
                return jsonify({'erro': f'Estoque insuficiente para {produto[1]}'}), 400
            
            subtotal = float(produto[2]) * quantidade
            valor_total += subtotal
            
            itens_validados.append({
                'id_produto': id_produto,
                'quantidade': quantidade,
                'preco_unitario': float(produto[2]),
                'subtotal': subtotal,
                'nome': produto[1]
            })
        
        # Inserir venda com status 'pendente' 
        cur.execute("""
            INSERT INTO vendas (id_cliente, valor_total, status)
            VALUES (%s, %s, 'pendente')
            RETURNING id_venda
        """, (id_cliente, valor_total))
        id_venda = cur.fetchone()[0]
        
        # Inserir itens 
        for item in itens_validados:
            cur.execute("""
                INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            """, (id_venda, item['id_produto'], item['quantidade'], 
                  item['preco_unitario'], item['subtotal']))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'id_venda': id_venda,
            'id_cliente': id_cliente,
            'status': 'pendente',
            'valor_total': valor_total,
            'itens': itens_validados
        }), 201
        
    except Exception as e:
        print(f"Erro ao criar compra: {e}")
        return jsonify({'erro': str(e)}), 500

# --------- REALIZAR VENDA ---------

@venda_bp.route('/vendas/direta', methods=['POST'])
@token_required
@role_required(['realizar_vendas'])
def criar_e_finalizar_venda(current_user):
    """Cria e finaliza uma venda"""
    try:
        dados = request.get_json()
        
        id_cliente = dados.get('id_cliente')
        itens = dados.get('itens', [])
        
        if not id_cliente:
            return jsonify({'erro': 'ID do cliente é obrigatório'}), 400
        
        if not itens:
            return jsonify({'erro': 'Venda sem itens'}), 400
        
        # Verificar cliente
        if not sistema.buscar_cliente(id_cliente):
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        # Verifica estoque e calcular total
        conn = get_connection()
        cur = conn.cursor()
        
        valor_total = 0
        itens_validados = []
        
        for item in itens:
            id_produto = item['id_produto']
            quantidade = item['quantidade']
            
            cur.execute("SELECT id_produto, nome, preco_unitario, estoque FROM produtos WHERE id_produto = %s", (id_produto,))
            produto = cur.fetchone()
            
            if not produto:
                cur.close()
                conn.close()
                return jsonify({'erro': f'Produto {id_produto} não encontrado'}), 404
            
            if produto[3] < quantidade:
                cur.close()
                conn.close()
                return jsonify({'erro': f'Estoque insuficiente para {produto[1]}'}), 400
            
            subtotal = float(produto[2]) * quantidade
            valor_total += subtotal
            
            itens_validados.append({
                'id_produto': id_produto,
                'quantidade': quantidade,
                'preco_unitario': float(produto[2]),
                'subtotal': subtotal,
                'nome': produto[1]
            })
        
        # Gera ID de transação
        import uuid
        id_transacao = f"TXN_{uuid.uuid4().hex[:8].upper()}"
        
        # Inserir venda
        cur.execute("""
            INSERT INTO vendas (id_cliente, valor_total, status, id_transacao_pagamento)
            VALUES (%s, %s, 'pago', %s)
            RETURNING id_venda
        """, (id_cliente, valor_total, id_transacao))
        id_venda = cur.fetchone()[0]
        
        # Inserir itens e atualizar estoque
        for item in itens_validados:
            cur.execute("""
                INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            """, (id_venda, item['id_produto'], item['quantidade'], item['preco_unitario'], item['subtotal']))
            
            # Atualizar estoque no banco
            cur.execute("UPDATE produtos SET estoque = estoque - %s WHERE id_produto = %s", 
                       (item['quantidade'], item['id_produto']))
            
            # Atualizar estoque na memória
            produto = sistema.buscar_produto(item['id_produto'])
            if produto:
                produto.estoque -= item['quantidade']
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'mensagem': 'Venda finalizada com sucesso!',
            'id_venda': id_venda,
            'status': 'pago',
            'valor_total': valor_total,  
            'itens': itens_validados
        }), 200
        
    except Exception as e:
        print(f"Erro ao criar e finalizar venda: {e}")
        return jsonify({'erro': str(e)}), 500

# --------- FINALIZAR VENDA ---------

@venda_bp.route('/vendas/<int:id_venda>/finalizar', methods=['POST'])
@token_required
def finalizar_venda(current_user, id_venda):
    """Finalizar venda pelo ID"""
    try:
        # Busca a venda no banco
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT v.*, c.nome as nome_cliente
            FROM vendas v
            JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE v.id_venda = %s
        """, (id_venda,))
        venda_data = cur.fetchone()
        cur.close()
        conn.close()
        
        if not venda_data:
            return jsonify({'erro': 'Venda não encontrada'}), 404
        
        # Verifica se já está finalizada
        if venda_data['status'] == 'pago':
            return jsonify({
                'mensagem': 'Venda já está finalizada!',
                'status': 'pago',
                'valor_total': float(venda_data['valor_total'])
            }), 200
        
        if venda_data['status'] == 'cancelado':
            return jsonify({'erro': 'Venda cancelada não pode ser finalizada'}), 400
        
        # Verifica permissão
        perfil = current_user.get('perfil')
        if perfil == 'cliente' and venda_data['id_cliente'] != current_user['id_cliente']:
            return jsonify({'erro': 'Você só pode finalizar suas próprias compras'}), 403
        
        # Atualiza status no banco
        conn = get_connection()
        cur = conn.cursor()
        
        import uuid
        id_transacao = f"TXN_{uuid.uuid4().hex[:8].upper()}"
        
        # Atualiza status da venda
        cur.execute("""
            UPDATE vendas 
            SET status = 'pago', id_transacao_pagamento = %s 
            WHERE id_venda = %s
            RETURNING valor_total
        """, (id_transacao, id_venda))
        
        resultado = cur.fetchone()
        valor_total = float(resultado[0]) if resultado else 0
        
        # Descontar Estoque
        cur.execute("""
            SELECT id_produto, quantidade
            FROM itens_venda
            WHERE id_venda = %s
        """, (id_venda,))
        itens = cur.fetchall()
        
        for item in itens:
            cur.execute("""
                UPDATE produtos 
                SET estoque = estoque - %s 
                WHERE id_produto = %s
            """, (item[1], item[0]))
            print(f"📦 Estoque descontado: produto {item[0]} - {item[1]} unidades")
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Atualizar na memória
        venda = sistema.buscar_venda(id_venda)
        if venda:
            venda.status = 'pago'
            venda.id_transacao_pagamento = id_transacao
        
        return jsonify({
            'mensagem': 'Venda finalizada com sucesso!',
            'status': 'pago',
            'valor_total': valor_total
        }), 200
        
    except Exception as e:
        print(f"Erro ao finalizar venda: {e}")
        return jsonify({'erro': str(e)}), 500
    
# --------- BUSCAR VENDA POR ID ---------

@venda_bp.route('/vendas/<int:id_venda>', methods=['GET'])
@token_required
def buscar_venda(current_user, id_venda):
    """Buscar venda por ID"""
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT v.*, c.nome as nome_cliente
            FROM vendas v
            JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE v.id_venda = %s
        """, (id_venda,))
        venda = cur.fetchone()
        
        if not venda:
            cur.close()
            conn.close()
            return jsonify({'erro': 'Venda não encontrada'}), 404
        
        # Busca itens
        cur.execute("""
            SELECT iv.*, p.nome as nome_produto
            FROM itens_venda iv
            JOIN produtos p ON iv.id_produto = p.id_produto
            WHERE iv.id_venda = %s
        """, (id_venda,))
        venda['itens'] = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify(venda), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# --------- CANCELAR VENDA ---------

@venda_bp.route('/vendas/<int:id_venda>/cancelar', methods=['POST'])
@token_required
@role_required(['cancelar_vendas'])
def cancelar_venda(current_user, id_venda):
    """Cancelar venda"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Verifica se a venda existe
        cur.execute("SELECT id_cliente, status FROM vendas WHERE id_venda = %s", (id_venda,))
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'erro': 'Venda não encontrada'}), 404
        
        id_cliente = row[0]
        status_atual = row[1]
        
        if status_atual == 'cancelado':
            cur.close()
            conn.close()
            return jsonify({'erro': 'Venda já está cancelada'}), 400
        
        if status_atual == 'pago':
            cur.close()
            conn.close()
            return jsonify({'erro': 'Venda já foi paga e não pode ser cancelada'}), 400
        
        # Motivo do cancelamento
        dados = request.get_json() or {}
        motivo = dados.get('motivo', 'Cancelado pelo gerente')
        
        # Atualiza status da venda
        cur.execute("UPDATE vendas SET status = 'cancelado' WHERE id_venda = %s", (id_venda,))
        
        # Registar na Tabela de Cancelamentos
        cur.execute("""
            INSERT INTO cancelamentos (id_venda, id_cliente, motivo)
            VALUES (%s, %s, %s)
        """, (id_venda, id_cliente, motivo))
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Atualiza na memória
        venda = sistema.buscar_venda(id_venda)
        if venda:
            venda.status = 'cancelado'
        
        return jsonify({
            'mensagem': 'Venda cancelada com sucesso!',
            'id_venda': id_venda,
            'status': 'cancelado',
            'motivo': motivo
        }), 200
        
    except Exception as e:
        print(f"Erro ao cancelar venda: {e}")
        return jsonify({'erro': str(e)}), 500
    
    
@venda_bp.route('/vendas/pendente', methods=['POST'])
@token_required
def criar_venda_pendente(current_user):
    """Cria uma venda pendente"""
    try:
        dados = request.get_json()
        
        id_cliente = dados.get('id_cliente')
        itens = dados.get('itens', [])
        
        if not id_cliente:
            return jsonify({'erro': 'ID do cliente é obrigatório'}), 400
        
        if not itens:
            return jsonify({'erro': 'Venda sem itens'}), 400
        
        # Verifica cliente
        if not sistema.buscar_cliente(id_cliente):
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        # Verifica estoque
        conn = get_connection()
        cur = conn.cursor()
        
        valor_total = 0
        itens_validados = []
        
        for item in itens:
            id_produto = item['id_produto']
            quantidade = item['quantidade']
            
            cur.execute("SELECT id_produto, nome, preco_unitario, estoque FROM produtos WHERE id_produto = %s", (id_produto,))
            produto = cur.fetchone()
            
            if not produto:
                cur.close()
                conn.close()
                return jsonify({'erro': f'Produto {id_produto} não encontrado'}), 404
            
            if produto[3] < quantidade:
                cur.close()
                conn.close()
                return jsonify({'erro': f'Estoque insuficiente para {produto[1]}'}), 400
            
            subtotal = float(produto[2]) * quantidade
            valor_total += subtotal
            
            itens_validados.append({
                'id_produto': id_produto,
                'quantidade': quantidade,
                'preco_unitario': float(produto[2]),
                'subtotal': subtotal
            })
        
        # Inserir venda com status 'pendente'
        cur.execute("""
            INSERT INTO vendas (id_cliente, valor_total, status)
            VALUES (%s, %s, 'pendente')
            RETURNING id_venda
        """, (id_cliente, valor_total))
        id_venda = cur.fetchone()[0]
        
        # Inserir itens
        for item in itens_validados:
            cur.execute("""
                INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            """, (id_venda, item['id_produto'], item['quantidade'], 
                  item['preco_unitario'], item['subtotal']))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'mensagem': 'Venda pendente criada com sucesso!',
            'id_venda': id_venda,
            'status': 'pendente',
            'valor_total': valor_total,
            'itens': itens_validados
        }), 201
        
    except Exception as e:
        print(f"Erro ao criar venda pendente: {e}")
        return jsonify({'erro': str(e)}), 500