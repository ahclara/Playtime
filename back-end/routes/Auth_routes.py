from flask import Blueprint, request, jsonify
from use_cases.AutenticarUsuarioUseCase import AutenticarUsuarioUseCase
from middleware.auth import token_required
from database.Conexao import get_connection
from instances import sistema
import bcrypt

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

# --------- LOGIN ---------

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
        print(f"Erro no login: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'erro': str(e)}), 500

# --------- REGISTRAR (CRIAR CLIENTE) ---------

@auth_bp.route('/registrar', methods=['POST'])
def registrar():
    """Registrar novo usuário (cliente)"""
    try:
        dados = request.get_json()
        
        # Valida campos obrigatórios
        required = ['nome', 'cpf', 'email', 'senha']
        for campo in required:
            if campo not in dados or not dados[campo]:
                return jsonify({'erro': f'Campo {campo} é obrigatório'}), 400
        
        conn = get_connection()
        cur = conn.cursor()
        
        # 1. Verifica se CPF já existe na tabela clientes
        cur.execute("SELECT id_cliente FROM clientes WHERE cpf = %s", (dados['cpf'],))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'erro': 'CPF já cadastrado'}), 400
        
        # 2. Verifica se Email já existe na tabela clientes
        cur.execute("SELECT id_cliente FROM clientes WHERE email = %s", (dados['email'],))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'erro': 'Email já cadastrado'}), 400
        
        # 3. Verifica se Email já existe na tabela usuarios
        cur.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (dados['email'],))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'erro': 'Email já cadastrado como usuário'}), 400
        
        # 4. Hash da senha
        senha_hash = bcrypt.hashpw(dados['senha'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 5. Inserir cliente
        cur.execute("""
            INSERT INTO clientes (nome, cpf, email, ativo)
            VALUES (%s, %s, %s, true)
            RETURNING id_cliente, nome, cpf, email
        """, (dados['nome'], dados['cpf'], dados['email']))
        cliente_data = cur.fetchone()
        id_cliente = cliente_data[0]
        nome_cliente = cliente_data[1]
        
        # 6. Inserir usuário 
        perfil = dados.get('perfil', 'cliente')
        cur.execute("""
            INSERT INTO usuarios (id_cliente, email, senha_hash, perfil, ativo, nome)
            VALUES (%s, %s, %s, %s, true, %s)
            RETURNING id_usuario
        """, (id_cliente, dados['email'], senha_hash, perfil, nome_cliente))
        id_usuario = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        # 7. Atualiza memória do sistema
        from models.Cliente import Cliente
        from models.Usuario import Usuario
        
        cliente = Cliente(
            id_cliente=id_cliente,
            nome=dados['nome'],
            cpf=dados['cpf'],
            email=dados['email'],
            ativo=True
        )
        sistema.clientes[id_cliente] = cliente
        
        usuario = Usuario(
            id_cliente=id_cliente,
            email=dados['email'],
            senha_hash=senha_hash,
            perfil=perfil,
            id_usuario=id_usuario,
            ativo=True,
            nome=nome_cliente
        )
        sistema.usuarios[id_usuario] = usuario
        
        return jsonify({
            'mensagem': 'Usuário registrado com sucesso!',
            'cliente': {
                'id_cliente': id_cliente,
                'nome': dados['nome'],
                'cpf': dados['cpf'],
                'email': dados['email']
            },
            'usuario': {
                'id_usuario': id_usuario,
                'email': dados['email'],
                'perfil': perfil,
                'nome': nome_cliente
            }
        }), 201
        
    except Exception as e:
        print(f"Erro ao registrar: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'erro': str(e)}), 500

# --------- BUSCAR PERFIL DO USUÁRIO LOGADO ---------

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

# --------- VERIFICAR SE EMAIL EXISTE ---------

@auth_bp.route('/verificar-email', methods=['POST'])
def verificar_email():
    """Verifica se um email já está cadastrado"""
    try:
        dados = request.get_json()
        email = dados.get('email')
        
        if not email:
            return jsonify({'erro': 'Email é obrigatório'}), 400
        
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (email,))
        existe = cur.fetchone() is not None
        cur.close()
        conn.close()
        
        return jsonify({'existe': existe}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500