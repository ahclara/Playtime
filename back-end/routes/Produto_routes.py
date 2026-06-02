from flask import Blueprint, request, jsonify
from instances import sistema

produto_bp = Blueprint('produto', __name__)

@produto_bp.route('/produtos', methods=['POST'])
def cadastrar_produto():
    try:
        dados = request.json
        if not dados:
            return jsonify({"erro": "JSON invalido"}), 400
        
        produto = sistema.cadastrar_produto(
            nome=dados.get('nome'),
            preco=dados.get('preco_unitario'),
            estoque=dados.get('estoque')
        )
        return jsonify({
            "id": produto.id_produto, 
            "nome": produto.nome,
            "preco": produto.preco_unitario,
            "estoque": produto.estoque,
            "mensagem": "Produto cadastrado com sucesso"
        }), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@produto_bp.route('/produtos', methods=['GET'])
def listar_produtos():
    try:
        produtos = [{
            "id": p.id_produto, 
            "nome": p.nome, 
            "preco": p.preco_unitario, 
            "estoque": p.estoque
        } for p in sistema.listar_produtos()]
        return jsonify(produtos)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@produto_bp.route('/produtos/<int:id_produto>', methods=['GET'])
def buscar_produto(id_produto):
    try:
        produto = sistema.buscar_produto(id_produto)
        if not produto:
            return jsonify({"erro": "Produto nao encontrado"}), 404
        return jsonify({
            "id": produto.id_produto, 
            "nome": produto.nome, 
            "preco": produto.preco_unitario, 
            "estoque": produto.estoque
        })
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@produto_bp.route('/produtos/<int:id_produto>', methods=['PUT'])
def atualizar_produto(id_produto):
    try:
        dados = request.json
        sucesso = sistema.atualizar_detalhes_produto(
            id_produto,
            nome=dados.get('nome'),
            preco=dados.get('preco_unitario')
        )
        if not sucesso:
            return jsonify({"erro": "Produto nao encontrado"}), 404
        return jsonify({"mensagem": "Produto atualizado com sucesso"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@produto_bp.route('/produtos/<int:id_produto>/estoque', methods=['PATCH'])
def atualizar_estoque(id_produto):
    try:
        dados = request.json
        produto = sistema.buscar_produto(id_produto)
        if not produto:
            return jsonify({"erro": "Produto nao encontrado"}), 404
        
        quantidade = dados.get('quantidade', 0)
        sucesso = produto.atualizar_estoque(quantidade)
        if not sucesso:
            return jsonify({"erro": "Estoque insuficiente"}), 400
        
        conn = sistema.get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE produtos SET estoque = %s WHERE id_produto = %s", (produto.estoque, id_produto))
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "mensagem": "Estoque atualizado", 
            "estoque_atual": produto.estoque
        })
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@produto_bp.route('/produtos/<int:id_produto>', methods=['DELETE'])
def deletar_produto(id_produto):
    try:
        sucesso = sistema.deletar_produto(id_produto)
        if not sucesso:
            return jsonify({"erro": "Produto nao encontrado"}), 404
        return jsonify({"mensagem": "Produto deletado com sucesso"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500