from flask import Flask

from routes.Cliente_routes import cliente_bp
from routes.Produto_routes import produto_bp
from routes.Venda_routes import venda_bp
from routes.ItemVenda_routes import item_venda_bp

app = Flask(__name__)

app.register_blueprint(cliente_bp)
app.register_blueprint(produto_bp)
app.register_blueprint(venda_bp)
app.register_blueprint(item_venda_bp)

if __name__ == "__main__":
    app.run(debug=True)