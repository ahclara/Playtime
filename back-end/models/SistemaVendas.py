from __future__ import annotations
from typing import List, Dict, Optional
from Cliente import Cliente
from Produto import Produto
from Venda import Venda
from ServicoPagamento import ServicoPagamento

class SistemaVendas:
    def __init__(self):
        self.clientes: Dict[int, Cliente] = {
            1: Cliente(id_cliente=1, nome="Cliente teste", cpf="999.999.999-99", email="abc@gmail.com")
        }
        self.produtos: Dict[int, Produto] = {
            101: Produto(id_produto=101, nome="Bola de futebol", preco_unitario=50.00, estoque=20),
            102: Produto(id_produto=102, nome="Boneca mamãe bebê", preco_unitario=120.50, estoque=5),
            103: Produto(id_produto=103, nome="Carrinho de controle", preco_unitario=85.00, estoque=15),
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
            print(f"ERRO: Cliente com ID {id_cliente} não encontrado.")
            return False
            
        if nome: cliente.nome = nome
        if email: cliente.email = email
        cliente.atualizar_cadastro()
        return True

    def deletar_cliente(self, id_cliente: int) -> bool:
        cliente = self.clientes.get(id_cliente)
        if not cliente:
            print(f"ERRO: Cliente com ID {id_cliente} não encontrado.")
            return False

        if any(v.cliente.id_cliente == id_cliente for v in self.vendas.values()):
            print(f"ERRO: Não é possível remover o cliente {cliente.nome} pois ele possui vendas registradas.")
            return False
        
        cliente.desativar()
        del self.clientes[id_cliente]
        print(f"Cliente {id_cliente} removido permanentemente.")
        return True

    def cadastrar_produto(self, nome: str, preco: float, estoque: int) -> Produto:
        produto = Produto(self.proximo_id_produto, nome, preco, estoque)
        self.produtos[self.proximo_id_produto] = produto
        self.proximo_id_produto += 1
        print(f"Produto '{nome}' cadastrado com ID {produto.id_produto}.")
        return produto

    def buscar_produto(self, id_produto: int) -> Optional[Produto]:
        return self.produtos.get(id_produto)
        
    def listar_produtos(self) -> List[Produto]:
        return list(self.produtos.values())
        
    def atualizar_detalhes_produto(self, id_produto: int, nome: Optional[str], preco: Optional[float]) -> bool:
        produto = self.buscar_produto(id_produto)
        if not produto:
            print(f"ERRO: Produto com ID {id_produto} não encontrado.")
            return False
            
        if nome: produto.nome = nome
        if preco is not None: produto.preco_unitario = preco
        print(f"Detalhes do produto {produto.nome} atualizados.")
        return True
    
    def deletar_produto(self, id_produto: int) -> bool:
        if id_produto not in self.produtos:
            print(f"ERRO: Produto com ID {id_produto} não encontrado.")
            return False
        
        produto = self.produtos[id_produto]
        del self.produtos[id_produto]
        print(f"Produto '{produto.nome}' (ID: {id_produto}) removido permanentemente.")
        return True

    def iniciar_nova_venda(self, id_cliente: int) -> Optional[Venda]:
        cliente = self.buscar_cliente(id_cliente)
        if not cliente:
            print(f"ERRO: Cliente com ID {id_cliente} não encontrado.")
            return None
            
        venda = Venda(self.proximo_id_venda, cliente, self.servico_pagamento)
        self.vendas[self.proximo_id_venda] = venda
        self.proximo_id_venda += 1
        print(f"Nova Venda {venda.id_pedido} iniciada para {cliente.nome}.")
        return venda

    def buscar_venda(self, id_venda: int) -> Optional[Venda]:
        return self.vendas.get(id_venda)

    def cancelar_venda_pendente(self, id_venda: int) -> bool:
        venda = self.buscar_venda(id_venda)
        if not venda:
            print(f"ERRO: Venda com ID {id_venda} não encontrada.")
            return False
            
        if venda.status == "pendente":
            venda.status = "cancelada"
            print(f"Venda {id_venda} CANCELADA. Estoque revertido.")
            for item in venda.itens:
                 item.produto.atualizar_estoque(item.quantidade)
            return True
        else:
            print(f"ERRO: Venda {id_venda} não está pendente. Status atual: {venda.status}. Necessário estorno para cancelar.")
            return False