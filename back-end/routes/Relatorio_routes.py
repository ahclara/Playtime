from flask import Blueprint, request, jsonify
from middleware.auth import token_required
from database.Conexao import get_connection

relatorio_bp = Blueprint('relatorios', __name__, url_prefix='/api')

@relatorio_bp.route('/relatorios/geral', methods=['GET'])
@token_required
def relatorio_geral(current_user):
    """Relatório geral do sistema"""
    try:
        # Verificação
        perfil = current_user.get('perfil')
        
        if perfil != 'gerente':
            return jsonify({
                'erro': 'Acesso negado. Apenas gerentes podem acessar relatórios.',
                'seu_perfil': perfil
            }), 403
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 1. Total de clientes ativos
        cur.execute("SELECT COUNT(*) FROM clientes WHERE ativo = true")
        total_clientes = cur.fetchone()[0]
        
        # 2. Total de produtos
        cur.execute("SELECT COUNT(*) FROM produtos")
        total_produtos = cur.fetchone()[0]
        
        # 3. Total de vendas com status 'pago'
        cur.execute("SELECT COUNT(*) FROM vendas WHERE status = 'pago'")
        vendas_concluidas = cur.fetchone()[0]
        
        # 4. Total arrecadado
        cur.execute("SELECT COALESCE(SUM(valor_total), 0) FROM vendas WHERE status = 'pago'")
        total_arrecadado = float(cur.fetchone()[0])
        
        # 5. Vendas por status
        cur.execute("""
            SELECT status, COUNT(*) as total, COALESCE(SUM(valor_total), 0) as soma
            FROM vendas 
            GROUP BY status
        """)
        vendas_por_status = cur.fetchall()
        
        # 6. Produtos mais vendidos (Top 5)
        cur.execute("""
            SELECT p.nome, SUM(iv.quantidade) as total_vendido
            FROM itens_venda iv
            JOIN produtos p ON iv.id_produto = p.id_produto
            JOIN vendas v ON iv.id_venda = v.id_venda
            WHERE v.status = 'pago'
            GROUP BY p.id_produto, p.nome
            ORDER BY total_vendido DESC
            LIMIT 5
        """)
        produtos_mais_vendidos = cur.fetchall()
        
        # 7. Clientes que mais compraram (Top 5)
        cur.execute("""
            SELECT c.nome, COUNT(v.id_venda) as total_compras, 
                   COALESCE(SUM(v.valor_total), 0) as total_gasto
            FROM clientes c
            JOIN vendas v ON c.id_cliente = v.id_cliente
            WHERE v.status = 'pago'
            GROUP BY c.id_cliente, c.nome
            ORDER BY total_gasto DESC
            LIMIT 5
        """)
        clientes_top = cur.fetchall()
        
        cur.close()
        conn.close()
        
        relatorio = {
            'total_clientes': total_clientes,
            'total_produtos': total_produtos,
            'total_vendas_concluidas': vendas_concluidas,
            'total_arrecadado': total_arrecadado,
            'vendas_por_status': [
                {'status': row[0], 'total': row[1], 'valor_total': float(row[2])} 
                for row in vendas_por_status
            ],
            'produtos_mais_vendidos': [
                {'nome': row[0], 'total_vendido': row[1]} for row in produtos_mais_vendidos
            ],
            'clientes_top': [
                {'nome': row[0], 'compras': row[1], 'total_gasto': float(row[2])} for row in clientes_top
            ]
        }
        
        return jsonify(relatorio), 200
        
    except Exception as e:
        print(f"Erro no relatório: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'erro': str(e)}), 500