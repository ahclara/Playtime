class ItemVenda:
    """Entidade ItemVenda"""
    
    def __init__(self, produto, quantidade, id_item=None, preco_unitario=None):
        self.id_item = id_item
        self.produto = produto
        self.quantidade = quantidade
        self.preco_unitario = preco_unitario if preco_unitario is not None else produto.preco_unitario
        self.subtotal = self.preco_unitario * quantidade
    
    def to_dict(self):
        return {
            'id_item': self.id_item,
            'id_produto': self.produto.id_produto if self.produto else None,
            'nome_produto': self.produto.nome if self.produto else None,
            'quantidade': self.quantidade,
            'preco_unitario': float(self.preco_unitario),
            'subtotal': float(self.subtotal)
        }
    
    def __str__(self):
        return f"Item: {self.produto.nome} x{self.quantidade} = R${self.subtotal:.2f}"