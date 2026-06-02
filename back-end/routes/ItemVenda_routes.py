from flask import Blueprint, request, jsonify
from app.instances import sistema

item_venda_bp = Blueprint('item_venda', __name__)

@item_venda_bp.route('/vendas/<int:id_venda>/itens', methods=['POST'])
def adicionar_item(id_venda):
    try:
        dados = request.json
        if not dados:
            return jsonify({"erro": "JSON inválido"}), 400
        
        venda = sistema.buscar_venda(id_venda)
        if not venda:
            return jsonify({"erro": "Venda não encontrada"}), 404
        
        produto = sistema.buscar_produto(dados.get('produto_id'))
        if not produto:
            return jsonify({"erro": "Produto não encontrado"}), 404
        
        quantidade = dados.get('quantidade', 1)
        if quantidade <= 0:
            return jsonify({"erro": "Quantidade deve ser maior que zero"}), 400
        
        venda.adicionar_item(produto, quantidade)
        return jsonify({
            "mensagem": "Item adicionado", 
            "total_atual": venda.valor_total
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@item_venda_bp.route('/vendas/<int:id_venda>/itens', methods=['GET'])
def listar_itens_venda(id_venda):
    try:
        venda = sistema.buscar_venda(id_venda)
        if not venda:
            return jsonify({"erro": "Venda não encontrada"}), 404
        
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
            return jsonify({"erro": "Venda não encontrada"}), 404
        
        for item in venda.itens:
            if item.produto.id_produto == produto_id:
                item.produto.atualizar_estoque(item.quantidade)
                venda.itens.remove(item)
                venda.calcular_total()
                return jsonify({
                    "mensagem": "Item removido", 
                    "total_atual": venda.valor_total
                }), 200
        
        return jsonify({"erro": "Item não encontrado nesta venda"}), 404
    except Exception as e:
        return jsonify({"erro": str(e)}), 500