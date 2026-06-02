from __future__ import annotations
from models.Produto import Produto

class ItemVenda:
    def __init__(self, produto: Produto, quantidade: int): 
        self.produto = produto
        self.quantidade = quantidade
        self.preco = produto.preco_unitario

    def calcular_subtotal(self) -> float:
        return self.quantidade * self.preco

    def __str__(self):
        return f"ItemVenda(Produto: {self.produto.nome}, Qtd: {self.quantidade}, Subtotal: R${self.calcular_subtotal():.2f})"