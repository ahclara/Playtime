from flask import Blueprint, request, jsonify
from instances import sistema

item_venda_bp = Blueprint('item_venda', __name__)

@item_venda_bp.route('/vendas/<int:id_venda>/itens', methods=['POST'])
def adicionar_item(id_venda):
    try:
        dados = request.json
        if not dados:
            return jsonify({"erro": "JSON invalido"}), 400
        
        produto_id = dados.get('produto_id')
        quantidade = dados.get('quantidade', 1)
        
        if not produto_id:
            return jsonify({"erro": "produto_id e obrigatorio"}), 400
        
        sucesso = sistema.adicionar_item_venda(id_venda, produto_id, quantidade)
        
        if not sucesso:
            return jsonify({"erro": "Venda nao encontrada, produto nao encontrado ou estoque insuficiente"}), 400
        
        venda = sistema.buscar_venda(id_venda)
        
        return jsonify({
            "mensagem": "Item adicionado",
            "total_atual": venda.valor_total if venda else 0
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@item_venda_bp.route('/vendas/<int:id_venda>/itens', methods=['GET'])
def listar_itens_venda(id_venda):
    try:
        venda = sistema.buscar_venda(id_venda)
        if not venda:
            return jsonify({"erro": "Venda nao encontrada"}), 404
        
        itens = [{
            "produto_id": item.produto.id_produto,
            "produto": item.produto.nome,
            "quantidade": item.quantidade,
            "preco_unitario": item.preco,
            "subtotal": item.calcular_subtotal()
        } for item in venda.itens]
        
        return jsonify(itens)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@item_venda_bp.route('/vendas/<int:id_venda>/itens/<int:produto_id>', methods=['DELETE'])
def remover_item(id_venda, produto_id):
    try:
        venda = sistema.buscar_venda(id_venda)
        if not venda:
            return jsonify({"erro": "Venda nao encontrada"}), 404
        
        for item in venda.itens:
            if item.produto.id_produto == produto_id:
                item.produto.atualizar_estoque(item.quantidade)
                venda.itens.remove(item)
                venda.calcular_total()
                
                conn = sistema.get_connection()
                cur = conn.cursor()
                cur.execute("DELETE FROM itens_venda WHERE id_venda = %s AND id_produto = %s", (id_venda, produto_id))
                cur.execute("UPDATE vendas SET valor_total = %s WHERE id_venda = %s", (venda.valor_total, id_venda))
                conn.commit()
                cur.close()
                conn.close()
                
                return jsonify({
                    "mensagem": "Item removido", 
                    "total_atual": venda.valor_total
                }), 200
        
        return jsonify({"erro": "Item nao encontrado nesta venda"}), 404
    except Exception as e:
        return jsonify({"erro": str(e)}), 500