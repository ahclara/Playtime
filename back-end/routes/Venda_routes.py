from flask import Blueprint, request, jsonify

venda_bp = Blueprint('venda', __name__)

vendas = []
proximo_id = 1

@venda_bp.route('/vendas', methods=['POST'])
def criar_venda():
    global proximo_id

    dados = request.json

    venda = {
        "id": proximo_id,
        "cliente_id": dados["cliente_id"],
        "status": "pendente",
        "valor_total": 0
    }

    vendas.append(venda)
    proximo_id += 1

    return jsonify(venda), 201

@venda_bp.route('/vendas', methods=['GET'])
def listar_vendas():
    return jsonify(vendas)