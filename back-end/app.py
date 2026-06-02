import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
        "sistema": "Playtime",
        "status": "online",
        "endpoints": {
            "clientes": "GET/POST /clientes",
            "produtos": "GET/POST /produtos",
            "vendas": "GET/POST /vendas",
            "finalizar": "POST /vendas/<id>/finalizar"
        }
    })

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
