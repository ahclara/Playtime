from __future__ import annotations
from typing import List, Dict, Optional
from models.Cliente import Cliente
from models.Produto import Produto
from models.Venda import Venda
from models.ServicoPagamento import ServicoPagamento

class SistemaVendas:
    def __init__(self):
        self.clientes: Dict[int, Cliente] = {
            1: Cliente(id_cliente=1, nome="Cliente Teste", cpf="999.999.999-99", email="teste@email.com")
        }
        self.produtos: Dict[int, Produto] = {
            101: Produto(id_produto=101, nome="Bola de Futebol", preco_unitario=50.00, estoque=20),
            102: Produto(id_produto=102, nome="Boneca", preco_unitario=120.50, estoque=5),
            103: Produto(id_produto=103, nome="Carrinho", preco_unitario=85.00, estoque=15),
        }
        self.vendas: Dict[int, Venda] = {}
        self.proximo_id_cliente = 2
        self.proximo_id_produto = 104
        self.proximo_id_venda = 1001
      
        self.servico_pagamento = ServicoPagamento(
            url_api="https://api.pagamentos.com/v1",
            token_autenticacao="abc123xyz"
        )
   
    def cadastrar_cliente(self, nome: str, cpf: str, email: str) -> Cliente:
        cliente = Cliente(self.proximo_id_cliente, nome, cpf, email)
        self.clientes[self.proximo_id_cliente] = cliente
        self.proximo_id_cliente += 1
        cliente.cadastrar()
        return cliente

    def buscar_cliente(self, id_cliente: int) -> Optional[Cliente]:
        return self.clientes.get(id_cliente)
    
    def atualizar_cliente(self, id_cliente: int, nome: Optional[str], email: Optional[str]) -> bool:
        cliente = self.buscar_cliente(id_cliente)
        if not cliente:
            return False
        if nome: 
            cliente.nome = nome
        if email: 
            cliente.email = email
        cliente.atualizar_cadastro()
        return True

    def deletar_cliente(self, id_cliente: int) -> bool:
        cliente = self.clientes.get(id_cliente)
        if not cliente:
            return False

        if any(v.cliente.id_cliente == id_cliente for v in self.vendas.values()):
            return False
        
        cliente.desativar()
        del self.clientes[id_cliente]
        return True

    def cadastrar_produto(self, nome: str, preco: float, estoque: int) -> Produto:
        produto = Produto(self.proximo_id_produto, nome, preco, estoque)
        self.produtos[self.proximo_id_produto] = produto
        self.proximo_id_produto += 1
        return produto

    def buscar_produto(self, id_produto: int) -> Optional[Produto]:
        return self.produtos.get(id_produto)
        
    def listar_produtos(self) -> List[Produto]:
        return list(self.produtos.values())
        
    def atualizar_detalhes_produto(self, id_produto: int, nome: Optional[str], preco: Optional[float]) -> bool:
        produto = self.buscar_produto(id_produto)
        if not produto:
            return False
        if nome: 
            produto.nome = nome
        if preco is not None: 
            produto.preco_unitario = preco
        return True
    
    def deletar_produto(self, id_produto: int) -> bool:
        if id_produto not in self.produtos:
            return False
        del self.produtos[id_produto]
        return True

    def iniciar_nova_venda(self, id_cliente: int) -> Optional[Venda]:
        cliente = self.buscar_cliente(id_cliente)
        if not cliente:
            return None
        venda = Venda(self.proximo_id_venda, cliente, self.servico_pagamento)
        self.vendas[self.proximo_id_venda] = venda
        self.proximo_id_venda += 1
        return venda

    def buscar_venda(self, id_venda: int) -> Optional[Venda]:
        return self.vendas.get(id_venda)

    def cancelar_venda_pendente(self, id_venda: int) -> bool:
        venda = self.buscar_venda(id_venda)
        if not venda:
            return False
        if venda.status == "pendente":
            venda.status = "cancelada"
            for item in venda.itens:
                item.produto.atualizar_estoque(item.quantidade)
            return True
        return False