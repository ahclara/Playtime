from flask import Blueprint, request, jsonify
from instances import sistema

venda_bp = Blueprint('venda', __name__)

@venda_bp.route('/vendas', methods=['POST'])
def criar_venda():
    try:
        dados = request.json
        if not dados:
            return jsonify({"erro": "JSON invalido"}), 400
        
        venda = sistema.iniciar_nova_venda(dados.get('cliente_id'))
        if not venda:
            return jsonify({"erro": "Cliente nao encontrado"}), 404
        return jsonify({
            "id": venda.id_pedido, 
            "status": venda.status,
            "mensagem": "Venda criada com sucesso"
        }), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@venda_bp.route('/vendas', methods=['GET'])
def listar_vendas():
    try:
        vendas = [{
            "id": v.id_pedido, 
            "cliente": v.cliente.nome, 
            "total": v.valor_total, 
            "status": v.status,
            "data": v.data_hora.isoformat()
        } for v in sistema.vendas.values()]
        return jsonify(vendas)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@venda_bp.route('/vendas/<int:id_venda>', methods=['GET'])
def buscar_venda(id_venda):
    try:
        venda = sistema.buscar_venda(id_venda)
        if not venda:
            return jsonify({"erro": "Venda nao encontrada"}), 404
        
        itens = [{
            "produto_id": item.produto.id_produto,
            "produto": item.produto.nome, 
            "quantidade": item.quantidade, 
            "subtotal": item.calcular_subtotal()
        } for item in venda.itens]
        
        return jsonify({
            "id": venda.id_pedido,
            "cliente": venda.cliente.nome,
            "cliente_id": venda.cliente.id_cliente,
            "data": venda.data_hora.isoformat(),
            "total": venda.valor_total,
            "status": venda.status,
            "itens": itens
        })
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@venda_bp.route('/vendas/<int:id_venda>', methods=['DELETE'])
def cancelar_venda(id_venda):
    try:
        sucesso = sistema.cancelar_venda_pendente(id_venda)
        if not sucesso:
            return jsonify({"erro": "Venda nao encontrada ou nao pode ser cancelada"}), 404
        return jsonify({"mensagem": "Venda cancelada com sucesso"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500