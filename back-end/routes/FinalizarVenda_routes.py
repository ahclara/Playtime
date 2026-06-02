from flask import Blueprint, request, jsonify
from instances import sistema

finalizar_bp = Blueprint('finalizar', __name__)

@finalizar_bp.route('/vendas/<int:id_venda>/finalizar', methods=['POST'])
def finalizar_venda(id_venda):
    try:
        dados = request.json or {}
        
        venda = sistema.buscar_venda(id_venda)
        if not venda:
            return jsonify({"erro": "Venda não encontrada"}), 404
        
        if not venda.itens:
            return jsonify({"erro": "Não é possível finalizar venda sem itens"}), 400
        
        dados_cartao = dados.get("dados_cartao", {
            "numero": "4111111111111111",
            "validade": "12/2028",
            "cvv": "123"
        })
        
        sucesso = venda.finalizar_venda(dados_cartao)
        
        if sucesso:
            return jsonify({
                "mensagem": "Venda finalizada com sucesso",
                "status": venda.status,
                "id_transacao": venda.id_transacao_pagamento,
                "valor_total": venda.valor_total
            }), 200
        else:
            return jsonify({
                "erro": "Falha no processamento do pagamento",
                "status": venda.status
            }), 400
    except Exception as e:
        return jsonify({"erro": str(e)}), 500