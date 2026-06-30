from flask import Blueprint, request, jsonify
from use_cases.ListarVendasPorPeriodoUseCase import ListarVendasPorPeriodoUseCase
from use_cases.GerarRelatorioProdutosMaisVendidosUseCase import GerarRelatorioProdutosMaisVendidosUseCase
from repositories.ProdutoRepository import ProdutoRepository
from repositories.ClienteRepository import ClienteRepository
from repositories.VendaRepository import VendaRepository
from middleware.auth import token_required, role_required

relatorio_bp = Blueprint('relatorios', __name__, url_prefix='/api')

@relatorio_bp.route('/relatorios/vendas-periodo', methods=['GET'])
@token_required
@role_required(['gerente'])
def relatorio_vendas_periodo(current_user):
    """Relatório de vendas por período"""
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        if not data_inicio or not data_fim:
            return jsonify({'erro': 'Parâmetros data_inicio e data_fim são obrigatórios'}), 400
        
        use_case = ListarVendasPorPeriodoUseCase()
        resultado = use_case.executar(data_inicio, data_fim)
        return jsonify({
            'periodo': {'data_inicio': data_inicio, 'data_fim': data_fim},
            'total_vendas': len(resultado),
            'vendas': resultado
        }), 200
    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@relatorio_bp.route('/relatorios/produtos-mais-vendidos', methods=['GET'])
@token_required
@role_required(['gerente'])
def relatorio_produtos_mais_vendidos(current_user):
    """Relatório de produtos mais vendidos"""
    try:
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        if not data_inicio or not data_fim:
            return jsonify({'erro': 'Parâmetros data_inicio e data_fim são obrigatórios'}), 400
        
        use_case = GerarRelatorioProdutosMaisVendidosUseCase()
        resultado = use_case.executar(data_inicio, data_fim)
        return jsonify(resultado), 200
    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@relatorio_bp.route('/relatorios/geral', methods=['GET'])
@token_required
@role_required(['gerente'])
def relatorio_geral(current_user):
    """Relatório geral do sistema"""
    try:
        cliente_repo = ClienteRepository()
        produto_repo = ProdutoRepository()
        venda_repo = VendaRepository()
        
        total_clientes = cliente_repo.contar()
        total_produtos = produto_repo.contar()
        total_vendas = venda_repo.contar_concluidas()
        total_arrecadado = venda_repo.somar_total_arrecadado()
        
        return jsonify({
            'total_clientes': total_clientes,
            'total_produtos': total_produtos,
            'total_vendas_concluidas': total_vendas,
            'total_arrecadado': float(total_arrecadado)
        }), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500