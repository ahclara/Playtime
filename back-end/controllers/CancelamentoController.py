from flask import Blueprint, request, jsonify
from repositories.CancelamentoRepository import CancelamentoRepository
from middleware.auth import token_required, role_required

cancelamento_bp = Blueprint('cancelamentos', __name__, url_prefix='/api')

@cancelamento_bp.route('/cancelamentos', methods=['GET'])
@token_required
@role_required(['gerente'])
def listar_cancelamentos(current_user):
    """Listar todos os cancelamentos"""
    try:
        repo = CancelamentoRepository()
        cancelamentos = repo.listar_todos()
        return jsonify([c.to_dict() for c in cancelamentos]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@cancelamento_bp.route('/cancelamentos/venda/<int:id_venda>', methods=['GET'])
@token_required
def buscar_cancelamento_por_venda(current_user, id_venda):
    """Buscar cancelamento por ID da venda"""
    try:
        repo = CancelamentoRepository()
        cancelamento = repo.buscar_por_venda(id_venda)
        if not cancelamento:
            return jsonify({'erro': 'Cancelamento não encontrado'}), 404
        return jsonify(cancelamento.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500