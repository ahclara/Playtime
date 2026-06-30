import jwt
import os
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor

SECRET_KEY = os.getenv("SECRET_KEY", "playtime_super_secret_key_2026")
ALGORITHM = "HS256"

def gerar_token(id_usuario, id_cliente, email, perfil):
    """Gera um token JWT para o usuário"""
    payload = {
        'id_usuario': id_usuario,
        'id_cliente': id_cliente,
        'email': email,
        'perfil': perfil,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def token_required(f):
    """Decorator para verificar token JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'erro': 'Token de autenticação é obrigatório'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            current_user = {
                'id_usuario': payload.get('id_usuario'),
                'id_cliente': payload.get('id_cliente'),
                'email': payload.get('email'),
                'perfil': payload.get('perfil', 'cliente')
            }
        except jwt.ExpiredSignatureError:
            return jsonify({'erro': 'Token expirado. Faça login novamente'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'erro': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def role_required(roles_permitidos):
    """Decorator para verificar permissões (RBAC)"""
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if not current_user:
                return jsonify({'erro': 'Usuário não autenticado'}), 401
            
            perfil_usuario = current_user.get('perfil', 'cliente')
            
            # Se o perfil do usuário está na lista de roles permitidos
            if perfil_usuario in roles_permitidos:
                return f(current_user, *args, **kwargs)
            
            # Se o perfil for 'gerente', permite tudo
            if perfil_usuario == 'gerente':
                return f(current_user, *args, **kwargs)
            
            # Mapeamento de permissões por perfil
            permissoes = {
                'gerente': [
                    'consultar_produtos', 
                    'gerenciar_produtos', 
                    'atualizar_estoque', 
                    'gerar_relatorios', 
                    'consultar_vendas', 
                    'cancelar_vendas', 
                    'gerenciar_clientes', 
                    'realizar_vendas',
                    'comprar_produtos',
                    'ver_proprias_compras'
                ],
                'vendedor': [
                    'consultar_produtos',
                    'realizar_vendas', 
                    'consultar_vendas', 
                    'gerenciar_clientes'
                ],
                'cliente': [
                    'consultar_produtos',
                    'comprar_produtos', 
                    'ver_proprias_compras'
                ]
            }
            
            permissoes_usuario = permissoes.get(perfil_usuario, [])
            
            # Verificar se o usuário tem pelo menos uma das permissões necessárias
            for role in roles_permitidos:
                if role in permissoes_usuario:
                    return f(current_user, *args, **kwargs)
            
            # Não tem permissão
            return jsonify({
                'erro': f'Acesso negado. Permissão necessária: {roles_permitidos}',
                'seu_perfil': perfil_usuario,
                'suas_permissoes': permissoes_usuario
            }), 403
        return decorated
    return decorator

def obter_usuario_por_email(email):
    """Busca um usuário pelo email"""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT u.*, c.nome 
        FROM usuarios u
        JOIN clientes c ON u.id_cliente = c.id_cliente
        WHERE u.email = %s
    """, (email,))
    usuario = cur.fetchone()
    cur.close()
    conn.close()
    return usuario