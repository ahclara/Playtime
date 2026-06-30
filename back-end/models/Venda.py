from datetime import datetime
from models.ItemVenda import ItemVenda

class Venda:
    """Entidade Venda"""
    
    def __init__(self, id_cliente, itens=None, id_venda=None, data_venda=None, status='pendente'):
        self.id_venda = id_venda
        self.id_cliente = id_cliente
        self.itens = itens or []
        self.data_venda = data_venda or datetime.now()
        self.status = status
        self.valor_total = self.calcular_total()
        self.id_transacao_pagamento = None
    
    @property
    def id_pedido(self):
        return self.id_venda
    
    @property
    def cliente(self):
        from instances import sistema
        return sistema.buscar_cliente(self.id_cliente)
    
    def calcular_total(self):
        return sum(item.subtotal for item in self.itens)
    
    def adicionar_item(self, produto, quantidade):
        if not produto.verificar_disponibilidade(quantidade):
            raise ValueError(f"Estoque insuficiente para {produto.nome}")
        
        item = ItemVenda(produto, quantidade)
        self.itens.append(item)
        self.valor_total = self.calcular_total()
        return self
    
    def finalizar(self):
        """Finaliza a venda"""
        if not self.itens:
            raise ValueError("Venda sem itens não pode ser finalizada")
        self.status = 'pago'
        return self
    
    def cancelar(self):
        """Cancela a venda"""
        if self.status == 'cancelada':
            raise ValueError("Venda já está cancelada")
        self.status = 'cancelada'
        for item in self.itens:
            item.produto.estoque += item.quantidade
        return self
    
    def to_dict(self):
        return {
            'id_venda': self.id_venda,
            'id_cliente': self.id_cliente,
            'data_venda': self.data_venda.isoformat() if self.data_venda else None,
            'valor_total': float(self.valor_total),
            'status': self.status,
            'itens': [item.to_dict() for item in self.itens],
            'quantidade_itens': len(self.itens)
        }
    
    def __str__(self):
        return f"Venda #{self.id_venda} | Cliente: {self.id_cliente} | Total: R${self.valor_total:.2f} | Status: {self.status}"