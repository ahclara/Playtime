from __future__ import annotations
from datetime import datetime
from typing import List, Dict, Optional 
from models.Cliente import Cliente
from models.ItemVenda import ItemVenda
from models.Produto import Produto
from models.ServicoPagamento import ServicoPagamento

class Venda:
    def __init__(self, id_pedido: int, cliente: Cliente, servico_pagamento: ServicoPagamento): 
        self.id_pedido = id_pedido 
        self.data_hora = datetime.now() 
        self.cliente = cliente 
        self.itens: List[ItemVenda] = [] 
        self.valor_total = 0.0 
        self.status = "pendente" 
        self.servico_pagamento = servico_pagamento 
        self.id_transacao_pagamento: Optional[str] = None

    def adicionar_item(self, produto: Produto, quantidade: int) -> None:
        if produto.estoque >= quantidade:
            item = ItemVenda(produto, quantidade)
            self.itens.append(item)
            produto.atualizar_estoque(-quantidade)
            self.calcular_total()
            print(f"Item '{produto.nome}' adicionado à Venda {self.id_pedido}.")
        else:
            print(f"ERRO: Estoque insuficiente de '{produto.nome}'")

    def calcular_total(self) -> float:
        self.valor_total = sum(item.calcular_subtotal() for item in self.itens)
        return self.valor_total

    def finalizar_venda(self, dados_cartao: Dict) -> bool:
        if not self.itens:
            return False

        if self.status != "pendente":
            return False

        self.calcular_total()

        id_transacao = self.servico_pagamento.processar_pagamento(self.valor_total, dados_cartao)

        if id_transacao:
            self.status = "pago"
            self.id_transacao_pagamento = id_transacao
            return True
        else:
            self.status = "falha_pagamento"
            for item in self.itens:
                item.produto.atualizar_estoque(item.quantidade)
            return False

    def __str__(self):
        itens_str = "\n".join(str(item) for item in self.itens)
        return (f"Venda(ID: {self.id_pedido}, Cliente: {self.cliente.nome}, "
                f"Data: {self.data_hora.strftime('%Y-%m-%d %H:%M')}, "
                f"Total: R${self.valor_total:.2f}, Status: {self.status})")