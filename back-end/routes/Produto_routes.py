from flask import Blueprint, request, jsonify

produto_bp = Blueprint('produto', __name__)

produtos = []
proximo_id = 1

@produto_bp.route('/produtos', methods=['POST'])
def cadastrar_produto():
    global proximo_id

    dados = request.json

    produto = {
        "id": proximo_id,
        "nome": dados["nome"],
        "preco_unitario": dados["preco_unitario"],
        "estoque": dados["estoque"]
    }

    produtos.append(produto)
    proximo_id += 1

    return jsonify(produto), 201

@produto_bp.route('/produtos', methods=['GET'])
def listar_produtos():
    return jsonify(produtos)