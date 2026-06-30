import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor
from middleware.auth import gerar_token

SECRET_KEY = os.getenv("SECRET_KEY", "playtime_super_secret_key_2026")

class AutenticarUsuarioUseCase:
    """Caso de Uso: Autenticar Usuário (JWT)"""
    
    def executar(self, email, senha):
        """Autentica um usuário e retorna token JWT"""
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # USAR LEFT JOIN para incluir usuários admin e vendedor
        cur.execute("""
            SELECT u.*, c.nome as nome_cliente
            FROM usuarios u
            LEFT JOIN clientes c ON u.id_cliente = c.id_cliente
            WHERE u.email = %s
        """, (email,))
        usuario = cur.fetchone()
        cur.close()
        conn.close()
        
        if not usuario:
            raise ValueError("Email ou senha inválidos")
        
        if not usuario['ativo']:
            raise ValueError("Email ou senha inválidos")
        
        if not bcrypt.checkpw(senha.encode('utf-8'), usuario['senha_hash'].encode('utf-8')):
            raise ValueError("Email ou senha inválidos")
        
        # Determina o nome do usuário
        nome_usuario = usuario.get('nome_cliente') or usuario.get('nome')
        if not nome_usuario:
            if usuario['perfil'] == 'gerente':
                nome_usuario = 'Administrador(a)'
            elif usuario['perfil'] == 'vendedor':
                nome_usuario = 'Vendedor(a)'
            else:
                nome_usuario = usuario['perfil'].capitalize()
        
        token = gerar_token(
            usuario['id_usuario'],
            usuario['id_cliente'],
            usuario['email'],
            usuario['perfil']
        )
        
        return {
            'token': token,
            'usuario': {
                'id_usuario': usuario['id_usuario'],
                'id_cliente': usuario['id_cliente'],
                'email': usuario['email'],
                'perfil': usuario['perfil'],
                'nome': nome_usuario
            }
        }