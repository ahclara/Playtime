import sys
import os
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from database.Conexao import init_db
from routes.Cliente_routes import cliente_bp
from routes.Produto_routes import produto_bp
from routes.Venda_routes import venda_bp
from routes.Relatorio_routes import relatorio_bp
from routes.Auth_routes import auth_bp

app = Flask(__name__)
CORS(app)

# Inicializa banco de dados
init_db()

# Registra Blueprints
app.register_blueprint(cliente_bp)
app.register_blueprint(produto_bp)
app.register_blueprint(venda_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(relatorio_bp)

@app.route('/')
def home():
    return jsonify({
        "sistema": "Playtime - Sistema de Loja de Brinquedos",
        "status": "online",
        "versao": "4.0"
    })

@app.route('/health')
def health():
    return jsonify({"status": "ok", "mensagem": "API Playtime funcionando"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)