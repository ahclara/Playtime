from flask import Blueprint, request, jsonify
from use_cases.AutenticarUsuarioUseCase import AutenticarUsuarioUseCase
from middleware.auth import token_required
from database.Conexao import get_connection
import bcrypt
from instances import sistema

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login e geração de token JWT"""
    try:
        dados = request.get_json()
        email = dados.get('email')
        senha = dados.get('senha')
        
        if not email or not senha:
            return jsonify({'erro': 'Email e senha são obrigatórios'}), 400
        
        use_case = AutenticarUsuarioUseCase()
        resultado = use_case.executar(email, senha)
        
        return jsonify(resultado), 200
    except ValueError as e:
        return jsonify({'erro': str(e)}), 401
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500

@auth_bp.route('/registrar', methods=['POST'])
def registrar():
    """Registrar novo usuário"""
    try:
        dados = request.get_json()
        
        # Verifica se já existe
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id_cliente FROM clientes WHERE cpf = %s OR email = %s", 
                   (dados['cpf'], dados['email']))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'erro': 'CPF ou Email já cadastrado'}), 400
        
        # Cria cliente
        cliente = sistema.cadastrar_cliente(
            nome=dados['nome'],
            cpf=dados['cpf'],
            email=dados['email'],
        )
        
        # Cria usuário com senha hash
        senha_hash = bcrypt.hashpw(dados['senha'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        perfil = dados.get('perfil', 'cliente')
        
        cur.execute("""
            INSERT INTO usuarios (id_cliente, email, senha_hash, perfil)
            VALUES (%s, %s, %s, %s)
        """, (cliente.id_cliente, dados['email'], senha_hash, perfil))
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'mensagem': 'Usuário registrado com sucesso',
            'cliente': cliente.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'erro': str(e)}), 400

@auth_bp.route('/me/perfil', methods=['GET'])
@token_required
def meu_perfil(current_user):
    """Buscar perfil do próprio usuário"""
    try:
        cliente = sistema.buscar_cliente(current_user['id_cliente'])
        if not cliente:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        return jsonify(cliente.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500