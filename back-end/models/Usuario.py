from datetime import datetime

class Usuario:
    """Entidade Usuario)"""
    
    def __init__(self, id_cliente, email, senha_hash, perfil='cliente', 
                 id_usuario=None, ativo=True, nome=None):
        self.id_usuario = id_usuario
        self.id_cliente = id_cliente
        self.email = email
        self.senha_hash = senha_hash
        self.perfil = perfil
        self.ativo = ativo
        self.nome = nome
        self.data_cadastro = datetime.now()
    
    def to_dict(self):
        return {
            'id_usuario': self.id_usuario,
            'id_cliente': self.id_cliente,
            'email': self.email,
            'perfil': self.perfil,
            'ativo': self.ativo,
            'nome': self.nome,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }
    
    def __str__(self):
        return f"Usuario({self.email}, {self.perfil})"
    
    def is_gerente(self):
        return self.perfil == 'gerente'
    
    def is_vendedor(self):
        return self.perfil == 'vendedor' or self.perfil == 'gerente'
    
    def is_cliente(self):
        return self.perfil == 'cliente'
    
    def tem_permissao(self, permissao):
        permissoes = {
            'gerente': ['consultar_produtos', 'gerenciar_produtos', 'atualizar_estoque', 
                       'gerenciar_clientes', 'consultar_vendas', 'cancelar_vendas', 
                       'gerar_relatorios'],
            'vendedor': ['consultar_produtos', 'realizar_vendas', 'consultar_vendas', 'gerenciar_clientes'],
            'cliente': ['consultar_produtos', 'comprar_produtos', 'ver_proprias_compras']
        }
        return permissao in permissoes.get(self.perfil, [])
    
    def __str__(self):
        return f"Usuario({self.email}, {self.perfil})"