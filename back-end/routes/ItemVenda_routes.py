from flask import Blueprint, request, jsonify

item_venda_bp = Blueprint('item_venda', __name__)

itens_venda = []

@item_venda_bp.route('/itens-venda', methods=['POST'])
def adicionar_item():

    dados = request.json

    item = {
        "produto_id": dados["produto_id"],
        "quantidade": dados["quantidade"]
    }

    itens_venda.append(item)

    return jsonify(item), 201

@item_venda_bp.route('/itens-venda', methods=['GET'])
def listar_itens():
    return jsonify(itens_venda)