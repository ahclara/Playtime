from flask import Blueprint, request, jsonify
from middleware.auth import token_required
from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor

item_venda_bp = Blueprint('item_venda', __name__)


def _venda(cur, id_venda):
    cur.execute("SELECT id_venda, id_cliente, status FROM vendas WHERE id_venda = %s", (id_venda,))
    return cur.fetchone()


# --------- ADICIONAR ITEM A UMA VENDA PENDENTE ---------

@item_venda_bp.route('/vendas/<int:id_venda>/itens', methods=['POST'])
@token_required
def adicionar_item(current_user, id_venda):
    """Adiciona um item a uma venda pendente"""
    conn = None
    try:
        dados = request.get_json() or {}
        id_produto = dados.get('id_produto') or dados.get('produto_id')
        try:
            quantidade = int(dados.get('quantidade', 1))
        except (TypeError, ValueError):
            return jsonify({'erro': 'Quantidade inválida'}), 400

        if not id_produto:
            return jsonify({'erro': 'id_produto é obrigatório'}), 400
        if quantidade <= 0:
            return jsonify({'erro': 'Quantidade deve ser maior que zero'}), 400

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        venda = _venda(cur, id_venda)
        if not venda:
            return jsonify({'erro': 'Venda não encontrada'}), 404
        if venda['status'] != 'pendente':
            return jsonify({'erro': 'Só é possível adicionar itens a vendas pendentes'}), 400
        if current_user.get('perfil') == 'cliente' and venda['id_cliente'] != current_user.get('id_cliente'):
            return jsonify({'erro': 'Você só pode alterar suas próprias compras'}), 403

        cur.execute("SELECT nome, preco_unitario, estoque FROM produtos WHERE id_produto = %s", (id_produto,))
        produto = cur.fetchone()
        if not produto:
            return jsonify({'erro': f'Produto {id_produto} não encontrado'}), 404
        if produto['estoque'] < quantidade:
            return jsonify({'erro': f"Estoque insuficiente para {produto['nome']}"}), 400

        preco = float(produto['preco_unitario'])
        subtotal = preco * quantidade
        cur.execute("""
            INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
            VALUES (%s, %s, %s, %s, %s)
        """, (id_venda, id_produto, quantidade, preco, subtotal))
        cur.execute("""
            UPDATE vendas
            SET valor_total = (SELECT COALESCE(SUM(subtotal), 0) FROM itens_venda WHERE id_venda = %s)
            WHERE id_venda = %s
            RETURNING valor_total
        """, (id_venda, id_venda))
        total = float(cur.fetchone()['valor_total'])
        conn.commit()

        return jsonify({'mensagem': 'Item adicionado', 'id_venda': id_venda, 'total_atual': total}), 201
    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    finally:
        if conn:
            conn.close()


# --------- LISTAR ITENS DE UMA VENDA ---------

@item_venda_bp.route('/vendas/<int:id_venda>/itens', methods=['GET'])
@token_required
def listar_itens_venda(current_user, id_venda):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        if not _venda(cur, id_venda):
            return jsonify({'erro': 'Venda não encontrada'}), 404
        cur.execute("""
            SELECT iv.id_item, iv.id_produto, p.nome AS nome_produto, iv.quantidade, iv.preco_unitario, iv.subtotal
            FROM itens_venda iv
            JOIN produtos p ON p.id_produto = iv.id_produto
            WHERE iv.id_venda = %s
        """, (id_venda,))
        return jsonify(cur.fetchall()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    finally:
        if conn:
            conn.close()


# --------- REMOVER ITEM DE UMA VENDA PENDENTE ---------

@item_venda_bp.route('/vendas/<int:id_venda>/itens/<int:id_produto>', methods=['DELETE'])
@token_required
def remover_item(current_user, id_venda, id_produto):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        venda = _venda(cur, id_venda)
        if not venda:
            return jsonify({'erro': 'Venda não encontrada'}), 404
        if venda['status'] != 'pendente':
            return jsonify({'erro': 'Só é possível remover itens de vendas pendentes'}), 400

        cur.execute("DELETE FROM itens_venda WHERE id_venda = %s AND id_produto = %s", (id_venda, id_produto))
        if cur.rowcount == 0:
            return jsonify({'erro': 'Item não encontrado nesta venda'}), 404
        cur.execute("""
            UPDATE vendas
            SET valor_total = (SELECT COALESCE(SUM(subtotal), 0) FROM itens_venda WHERE id_venda = %s)
            WHERE id_venda = %s
            RETURNING valor_total
        """, (id_venda, id_venda))
        total = float(cur.fetchone()['valor_total'])
        conn.commit()
        return jsonify({'mensagem': 'Item removido', 'total_atual': total}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    finally:
        if conn:
            conn.close()
