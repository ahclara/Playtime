from flask import Blueprint, request, jsonify
from instances import sistema

finalizar_bp = Blueprint('finalizar', __name__)

@finalizar_bp.route('/vendas/<int:id_venda>/finalizar', methods=['POST'])
def finalizar_venda(id_venda):
    try:
        dados = request.json or {}
        
        dados_cartao = dados.get("dados_cartao", {
            "numero": "4111111111111111",
            "validade": "12/2028",
            "cvv": "123"
        })
        
        sucesso = sistema.finalizar_venda(id_venda, dados_cartao)
        
        if sucesso:
            venda = sistema.buscar_venda(id_venda)
            return jsonify({
                "mensagem": "Venda finalizada com sucesso",
                "status": venda.status if venda else "pago",
                "id_transacao": venda.id_transacao_pagamento if venda else None,
                "valor_total": venda.valor_total if venda else 0
            }), 200
        else:
            return jsonify({
                "erro": "Falha no processamento do pagamento"
            }), 400
    except Exception as e:
        return jsonify({"erro": str(e)}), 500