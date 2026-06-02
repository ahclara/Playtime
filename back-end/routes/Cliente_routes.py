from flask import Blueprint, request, jsonify
from instances import sistema

cliente_bp = Blueprint('cliente', __name__)

@cliente_bp.route('/clientes', methods=['POST'])
def cadastrar_cliente():
    try:
        dados = request.json
        if not dados:
            return jsonify({"erro": "JSON inválido"}), 400
        
        cliente = sistema.cadastrar_cliente(
            nome=dados.get('nome'),
            cpf=dados.get('cpf'),
            email=dados.get('email')
        )
        return jsonify({
            "id": cliente.id_cliente, 
            "nome": cliente.nome,
            "mensagem": "Cliente cadastrado com sucesso"
        }), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@cliente_bp.route('/clientes', methods=['GET'])
def listar_clientes():
    try:
        clientes = [{
            "id": c.id_cliente, 
            "nome": c.nome, 
            "cpf": c.cpf, 
            "email": c.email
        } for c in sistema.clientes.values()]
        return jsonify(clientes)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['GET'])
def buscar_cliente(id_cliente):
    try:
        cliente = sistema.buscar_cliente(id_cliente)
        if not cliente:
            return jsonify({"erro": "Cliente não encontrado"}), 404
        return jsonify({
            "id": cliente.id_cliente, 
            "nome": cliente.nome, 
            "cpf": cliente.cpf, 
            "email": cliente.email
        })
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['PUT'])
def atualizar_cliente(id_cliente):
    try:
        dados = request.json
        sucesso = sistema.atualizar_cliente(
            id_cliente, 
            nome=dados.get('nome'), 
            email=dados.get('email')
        )
        if not sucesso:
            return jsonify({"erro": "Cliente não encontrado"}), 404
        return jsonify({"mensagem": "Cliente atualizado com sucesso"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['DELETE'])
def deletar_cliente(id_cliente):
    try:
        sucesso = sistema.deletar_cliente(id_cliente)
        if not sucesso:
            return jsonify({"erro": "Cliente não encontrado ou possui vendas"}), 404
        return jsonify({"mensagem": "Cliente deletado com sucesso"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500