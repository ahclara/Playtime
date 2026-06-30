from flask import Blueprint, request, jsonify
from use_cases.ConsultarProdutoUseCase import ConsultarProdutoUseCase
from repositories.ProdutoRepository import ProdutoRepository
from models.Produto import Produto
from middleware.auth import token_required, role_required

produto_bp = Blueprint('produtos', __name__, url_prefix='/api')

@produto_bp.route('/produtos', methods=['GET'])
def listar_produtos():
    """Listar todos os produtos"""
    try:
        filtro = request.args.get('filtro')
        use_case = ConsultarProdutoUseCase()
        resultado = use_case.executar(filtro)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@produto_bp.route('/produtos/<int:id_produto>', methods=['GET'])
def buscar_produto(id_produto):
    """Buscar produto por ID"""
    try:
        repo = ProdutoRepository()
        produto = repo.buscar_por_id(id_produto)
        if not produto:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        return jsonify(produto.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@produto_bp.route('/produtos', methods=['POST'])
@token_required
@role_required(['gerente'])
def criar_produto(current_user):
    """Criar novo produto"""
    try:
        dados = request.get_json()
        
        produto = Produto(
            nome=dados['nome'],
            preco_unitario=dados['preco_unitario'],
            estoque=dados.get('estoque', 0),
            descricao=dados.get('descricao'),
            categoria=dados.get('categoria')
        )
        
        repo = ProdutoRepository()
        produto_criado = repo.criar(produto)
        
        return jsonify(produto_criado.to_dict()), 201
    except KeyError as e:
        return jsonify({'erro': f'Campo obrigatório: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@produto_bp.route('/produtos/<int:id_produto>', methods=['PUT'])
@token_required
@role_required(['gerente'])
def atualizar_produto(current_user, id_produto):
    """Atualizar produto"""
    try:
        dados = request.get_json()
        repo = ProdutoRepository()
        
        produto = repo.buscar_por_id(id_produto)
        if not produto:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        
        produto.nome = dados.get('nome', produto.nome)
        produto.descricao = dados.get('descricao', produto.descricao)
        produto.preco_unitario = dados.get('preco_unitario', produto.preco_unitario)
        produto.categoria = dados.get('categoria', produto.categoria)
        
        produto_atualizado = repo.atualizar(produto)
        return jsonify(produto_atualizado.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@produto_bp.route('/produtos/<int:id_produto>/estoque', methods=['PATCH'])
@token_required
@role_required(['gerente'])
def atualizar_estoque(current_user, id_produto):
    """Atualizar estoque do produto"""
    try:
        dados = request.get_json()
        quantidade = dados.get('quantidade')
        
        if quantidade is None:
            return jsonify({'erro': 'Quantidade é obrigatória'}), 400
        
        repo = ProdutoRepository()
        produto = repo.buscar_por_id(id_produto)
        if not produto:
            return jsonify({'erro': 'Produto não encontrado'}), 404
        
        nova_quantidade = produto.estoque + quantidade
        if nova_quantidade < 0:
            return jsonify({'erro': 'Estoque não pode ficar negativo'}), 400
        
        repo.atualizar_estoque(id_produto, nova_quantidade)
        
        return jsonify({
            'mensagem': 'Estoque atualizado com sucesso',
            'id_produto': id_produto,
            'estoque_atual': nova_quantidade
        }), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@produto_bp.route('/produtos/<int:id_produto>', methods=['DELETE'])
@token_required
@role_required(['gerente'])
def deletar_produto(current_user, id_produto):
    """Deletar produto"""
    try:
        repo = ProdutoRepository()
        if repo.deletar(id_produto):
            return jsonify({'mensagem': 'Produto deletado com sucesso'}), 200
        return jsonify({'erro': 'Erro ao deletar produto'}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500