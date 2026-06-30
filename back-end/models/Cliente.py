from datetime import datetime

class Cliente:
    """Entidade Cliente"""
    
    def __init__(self, nome, cpf, email, id_cliente=None, ativo=True):
        self.id_cliente = id_cliente
        self.nome = nome
        self.cpf = cpf
        self.email = email
        self.ativo = ativo
        self.data_cadastro = datetime.now()
    
    def to_dict(self):
        return {
            'id_cliente': self.id_cliente,
            'nome': self.nome,
            'cpf': self.cpf,
            'email': self.email,
            'ativo': self.ativo,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }
    
    def __str__(self):
        return f"Cliente({self.nome})"