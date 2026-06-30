from flask import Blueprint, request, jsonify
from repositories.ClienteRepository import ClienteRepository
from models.Cliente import Cliente
from middleware.auth import token_required, role_required

cliente_bp = Blueprint('clientes', __name__, url_prefix='/api')

@cliente_bp.route('/clientes', methods=['GET'])
@token_required
@role_required(['gerente', 'vendedor'])
def listar_clientes(current_user):
    """Listar todos os clientes"""
    try:
        repo = ClienteRepository()
        clientes = repo.listar_todos()
        return jsonify([c.to_dict() for c in clientes]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['GET'])
@token_required
def buscar_cliente(current_user, id_cliente):
    """Buscar cliente por ID"""
    try:
        repo = ClienteRepository()
        cliente = repo.buscar_por_id(id_cliente)
        if not cliente:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        return jsonify(cliente.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@cliente_bp.route('/clientes', methods=['POST'])
def criar_cliente():
    """Criar novo cliente"""
    try:
        dados = request.get_json()
        
        # Verifica se CPF já existe
        repo = ClienteRepository()
        if repo.buscar_por_cpf(dados['cpf']):
            return jsonify({'erro': 'CPF já cadastrado'}), 400
        
        cliente = Cliente(
            nome=dados['nome'],
            cpf=dados['cpf'],
            email=dados['email'],
        )
        
        cliente_criado = repo.criar(cliente)
        return jsonify(cliente_criado.to_dict()), 201
    except KeyError as e:
        return jsonify({'erro': f'Campo obrigatório: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['PUT'])
@token_required
def atualizar_cliente(current_user, id_cliente):
    """Atualizar cliente"""
    try:
        # Verifica se o usuário é o dono do perfil ou é gerente
        if current_user['id_cliente'] != id_cliente and current_user['perfil'] != 'gerente':
            return jsonify({'erro': 'Permissão negada'}), 403
        
        dados = request.get_json()
        repo = ClienteRepository()
        
        cliente = repo.buscar_por_id(id_cliente)
        if not cliente:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        cliente.nome = dados.get('nome', cliente.nome)
        cliente.email = dados.get('email', cliente.email)
        
        cliente_atualizado = repo.atualizar(cliente)
        return jsonify(cliente_atualizado.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['DELETE'])
@token_required
@role_required(['gerente'])
def deletar_cliente(current_user, id_cliente):
    """Deletar cliente"""
    try:
        repo = ClienteRepository()
        if repo.deletar(id_cliente):
            return jsonify({'mensagem': 'Cliente deletado com sucesso'}), 200
        return jsonify({'erro': 'Erro ao deletar cliente'}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@cliente_bp.route('/clientes/me/perfil', methods=['GET'])
@token_required
def meu_perfil(current_user):
    """Buscar perfil do próprio usuário"""
    try:
        repo = ClienteRepository()
        cliente = repo.buscar_por_id(current_user['id_cliente'])
        if not cliente:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        return jsonify(cliente.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500