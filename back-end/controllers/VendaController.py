from flask import Blueprint, request, jsonify
from use_cases.RealizarVendaUseCase import RealizarVendaUseCase
from use_cases.CancelarVendaUseCase import CancelarVendaUseCase
from repositories.VendaRepository import VendaRepository
from middleware.auth import token_required, role_required

venda_bp = Blueprint('vendas', __name__, url_prefix='/api')

@venda_bp.route('/vendas', methods=['POST'])
@token_required
@role_required(['vendedor', 'gerente'])
def realizar_venda(current_user):
    """Realizar uma nova venda"""
    try:
        dados = request.get_json()
        use_case = RealizarVendaUseCase()
        resultado = use_case.executar(dados)
        return jsonify(resultado), 201
    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@venda_bp.route('/vendas', methods=['GET'])
@token_required
@role_required(['vendedor', 'gerente'])
def listar_vendas(current_user):
    """Listar todas as vendas"""
    try:
        repo = VendaRepository()
        vendas = repo.listar_todos()
        return jsonify([{
            'id_venda': v.id_venda,
            'id_cliente': v.id_cliente,
            'data_venda': v.data_venda.isoformat() if v.data_venda else None,
            'valor_total': float(v.valor_total),
            'status': v.status,
            'metodo_pagamento': v.metodo_pagamento
        } for v in vendas]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@venda_bp.route('/vendas/<int:id_venda>', methods=['GET'])
@token_required
def buscar_venda(current_user, id_venda):
    """Buscar venda por ID"""
    try:
        repo = VendaRepository()
        venda = repo.buscar_por_id(id_venda)
        if not venda:
            return jsonify({'erro': 'Venda não encontrada'}), 404
        
        # Verifica permissão
        if current_user['perfil'] == 'cliente' and venda.id_cliente != current_user['id_cliente']:
            return jsonify({'erro': 'Permissão negada'}), 403
        
        return jsonify(venda.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@venda_bp.route('/compras/cliente/<int:id_cliente>', methods=['GET'])
@token_required
def listar_compras_cliente(current_user, id_cliente):
    """Listar compras de um cliente"""
    try:
        # Verifica permissão
        if current_user['perfil'] == 'cliente' and current_user['id_cliente'] != id_cliente:
            return jsonify({'erro': 'Permissão negada'}), 403
        
        repo = VendaRepository()
        vendas = repo.listar_por_cliente(id_cliente)
        return jsonify([{
            'id_venda': v.id_venda,
            'data_venda': v.data_venda.isoformat() if v.data_venda else None,
            'valor_total': float(v.valor_total),
            'status': v.status
        } for v in vendas]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@venda_bp.route('/vendas/<int:id_venda>/cancelar', methods=['POST'])
@token_required
@role_required(['gerente'])
def cancelar_venda(current_user, id_venda):
    """Cancelar uma venda"""
    try:
        dados = request.get_json()
        motivo = dados.get('motivo', 'Cancelamento realizado pelo gerente')
        
        use_case = CancelarVendaUseCase()
        resultado = use_case.executar(id_venda, motivo, current_user['id_cliente'])
        return jsonify(resultado), 200
    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500