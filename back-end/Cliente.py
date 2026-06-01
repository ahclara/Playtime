from __future__ import annotations
from typing import Dict, Optional 

class Cliente:
    def __init__(self, id_cliente: int, nome: str, cpf: str, email: str):
        self.id_cliente = id_cliente 
        self.nome = nome 
        self.cpf = cpf 
        self.email = email 

    def cadastrar(self) -> None:
        print(f"Cliente '{self.nome}' com ID {self.id_cliente} cadastrado.")
    
    def atualizar_cadastro(self) -> None:
        print(f"Cadastro do cliente'{self.nome}' atualizado.")
    
    def desativar(self) -> None:
        print(f"Cliente '{self.nome}' (ID: {self.id_cliente}) marcado para desativação.")

    def __str__(self):
        return f"Cliente(ID: {self.id_cliente}, Nome: {self.nome}, CPF: {self.cpf})"

    def __repr__(self):
        return f"Cliente(ID: {self.id_cliente}, Nome: {self.nome})"