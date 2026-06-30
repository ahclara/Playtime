from datetime import datetime

class Produto:
    """Entidade Produto"""
    
    def __init__(self, nome, preco_unitario, estoque=0, id_produto=None):
        self.id_produto = id_produto
        self.nome = nome
        self.preco_unitario = preco_unitario
        self.estoque = estoque
        self.data_cadastro = datetime.now()
    
    def to_dict(self):
        return {
            'id_produto': self.id_produto,
            'nome': self.nome,
            'preco_unitario': float(self.preco_unitario),
            'estoque': self.estoque,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }
    
    def atualizar_estoque(self, quantidade):
        if self.estoque + quantidade < 0:
            raise ValueError("Estoque não pode ficar negativo")
        self.estoque += quantidade
        return self
    
    def verificar_disponibilidade(self, quantidade):
        return self.estoque >= quantidade
    
    def __str__(self):
        return f"Produto({self.nome}, R${self.preco_unitario:.2f}, Estoque: {self.estoque})"