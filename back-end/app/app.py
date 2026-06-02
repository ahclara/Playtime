import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify
from flask_cors import CORS
from routes.Cliente_routes import cliente_bp
from routes.Produto_routes import produto_bp
from routes.Venda_routes import venda_bp
from routes.ItemVenda_routes import item_venda_bp
from routes.FinalizarVenda_routes import finalizar_bp

app = Flask(__name__)
CORS(app)  

app.register_blueprint(cliente_bp)
app.register_blueprint(produto_bp)
app.register_blueprint(venda_bp)
app.register_blueprint(item_venda_bp)
app.register_blueprint(finalizar_bp)

@app.route('/')
def home():
    return jsonify({
        "sistema": "Playtime - Sistema de Loja de Brinquedos",
        "status": "online",
        "versao": "2.0",
        "endpoints": {
            "clientes": {
                "GET /clientes": "Listar todos os clientes",
                "GET /clientes/<id>": "Buscar cliente por ID",
                "POST /clientes": "Cadastrar novo cliente",
                "PUT /clientes/<id>": "Atualizar cliente",
                "DELETE /clientes/<id>": "Deletar cliente"
            },
            "produtos": {
                "GET /produtos": "Listar todos os produtos",
                "GET /produtos/<id>": "Buscar produto por ID",
                "POST /produtos": "Cadastrar novo produto",
                "PUT /produtos/<id>": "Atualizar produto",
                "PATCH /produtos/<id>/estoque": "Atualizar estoque",
                "DELETE /produtos/<id>": "Deletar produto"
            },
            "vendas": {
                "GET /vendas": "Listar todas as vendas",
                "GET /vendas/<id>": "Buscar venda por ID",
                "POST /vendas": "Criar nova venda",
                "DELETE /vendas/<id>": "Cancelar venda pendente"
            },
            "itens_venda": {
                "POST /vendas/<id>/itens": "Adicionar item à venda",
                "GET /vendas/<id>/itens": "Listar itens da venda",
                "DELETE /vendas/<id>/itens/<produto_id>": "Remover item da venda"
            },
            "finalizar_venda": {
                "POST /vendas/<id>/finalizar": "Finalizar venda com pagamento"
            }
        }
    })

@app.route('/health')
def health():
    return jsonify({"status": "ok", "mensagem": "API Playtime funcionando"})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)