from flask import Blueprint, request, jsonify

cliente_bp = Blueprint('cliente', __name__)

clientes = []
proximo_id = 1


@cliente_bp.route('/clientes', methods=['POST'])
def cadastrar_cliente():
    global proximo_id

    dados = request.json

    cliente = {
        "id": proximo_id,
        "nome": dados["nome"],
        "cpf": dados["cpf"],
        "email": dados["email"]
    }

    clientes.append(cliente)
    proximo_id += 1

    return jsonify(cliente), 201


@cliente_bp.route('/clientes', methods=['GET'])
def listar_clientes():
    return jsonify(clientes)
@cliente_bp.route('/popular')
def popular():
    clientes.append({
        "id": 1,
        "nome": "Eduarda",
        "cpf": "12345678900",
        "email": "eduarda@gmail.com"
    })

    return {"mensagem": "cliente adicionado"}