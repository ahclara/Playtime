from __future__ import annotations
from typing import List, Dict, Optional
from models.Cliente import Cliente
from models.Produto import Produto
from models.Venda import Venda
from models.ServicoPagamento import ServicoPagamento
from database.Conexao import get_connection
from datetime import datetime

class SistemaVendas:
    def __init__(self):
        self.servico_pagamento = ServicoPagamento(
            url_api="https://api.pagamentos.com/v1",
            token_autenticacao="abc123xyz"
        )
    
    def cadastrar_cliente(self, nome: str, cpf: str, email: str) -> Cliente:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO clientes (nome, cpf, email) VALUES (%s, %s, %s) RETURNING id_cliente",
            (nome, cpf, email)
        )
        id_cliente = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Cliente '{nome}' cadastrado com ID {id_cliente}")
        return Cliente(id_cliente, nome, cpf, email)

    def buscar_cliente(self, id_cliente: int) -> Optional[Cliente]:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT * FROM clientes WHERE id_cliente = %s", (id_cliente,))
        resultado = cur.fetchone()
        cur.close()
        conn.close()
        
        if resultado:
            return Cliente(resultado[0], resultado[1], resultado[2], resultado[3])
        return None
    
    def listar_clientes(self) -> List[Cliente]:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT * FROM clientes ORDER BY id_cliente")
        resultados = cur.fetchall()
        cur.close()
        conn.close()
        
        return [Cliente(r[0], r[1], r[2], r[3]) for r in resultados]
    
    def atualizar_cliente(self, id_cliente: int, nome: Optional[str], email: Optional[str]) -> bool:
        cliente = self.buscar_cliente(id_cliente)
        if not cliente:
            print(f"Cliente ID {id_cliente} nao encontrado")
            return False
        
        conn = get_connection()
        cur = conn.cursor()
        
        if nome:
            cur.execute("UPDATE clientes SET nome = %s WHERE id_cliente = %s", (nome, id_cliente))
        if email:
            cur.execute("UPDATE clientes SET email = %s WHERE id_cliente = %s", (email, id_cliente))
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"Cliente ID {id_cliente} atualizado")
        return True

    def deletar_cliente(self, id_cliente: int) -> bool:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) FROM vendas WHERE id_cliente = %s", (id_cliente,))
        count = cur.fetchone()[0]
        
        if count > 0:
            print(f"Cliente ID {id_cliente} possui vendas, nao pode ser deletado")
            cur.close()
            conn.close()
            return False
        
        cur.execute("DELETE FROM clientes WHERE id_cliente = %s", (id_cliente,))
        conn.commit()
        cur.close()
        conn.close()
        print(f"Cliente ID {id_cliente} deletado")
        return True
    
    def cadastrar_produto(self, nome: str, preco: float, estoque: int) -> Produto:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO produtos (nome, preco_unitario, estoque) VALUES (%s, %s, %s) RETURNING id_produto",
            (nome, preco, estoque)
        )
        id_produto = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Produto '{nome}' cadastrado com ID {id_produto}")
        return Produto(id_produto, nome, preco, estoque)

    def buscar_produto(self, id_produto: int) -> Optional[Produto]:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT * FROM produtos WHERE id_produto = %s", (id_produto,))
        resultado = cur.fetchone()
        cur.close()
        conn.close()
        
        if resultado:
            return Produto(resultado[0], resultado[1], resultado[2], resultado[3])
        return None
    
    def listar_produtos(self) -> List[Produto]:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT * FROM produtos ORDER BY id_produto")
        resultados = cur.fetchall()
        cur.close()
        conn.close()
        
        return [Produto(r[0], r[1], r[2], r[3]) for r in resultados]
    
    def atualizar_detalhes_produto(self, id_produto: int, nome: Optional[str], preco: Optional[float]) -> bool:
        produto = self.buscar_produto(id_produto)
        if not produto:
            print(f"Produto ID {id_produto} nao encontrado")
            return False
        
        conn = get_connection()
        cur = conn.cursor()
        
        if nome:
            cur.execute("UPDATE produtos SET nome = %s WHERE id_produto = %s", (nome, id_produto))
        if preco is not None:
            cur.execute("UPDATE produtos SET preco_unitario = %s WHERE id_produto = %s", (preco, id_produto))
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"Produto ID {id_produto} atualizado")
        return True
    
    def deletar_produto(self, id_produto: int) -> bool:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("DELETE FROM produtos WHERE id_produto = %s", (id_produto,))
        conn.commit()
        cur.close()
        conn.close()
        print(f"Produto ID {id_produto} deletado")
        return True
    
    def iniciar_nova_venda(self, id_cliente: int) -> Optional[Venda]:
        cliente = self.buscar_cliente(id_cliente)
        if not cliente:
            print(f"Cliente ID {id_cliente} nao encontrado")
            return None
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO vendas (id_cliente, status, valor_total) VALUES (%s, 'pendente', 0) RETURNING id_venda",
            (id_cliente,)
        )
        id_venda = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Nova venda ID {id_venda} criada para {cliente.nome}")
        
        venda = Venda(id_venda, cliente, self.servico_pagamento)
        venda.status = "pendente"
        venda.valor_total = 0
        return venda

    def buscar_venda(self, id_venda: int) -> Optional[Venda]:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT v.*, c.id_cliente, c.nome, c.cpf, c.email 
            FROM vendas v 
            JOIN clientes c ON v.id_cliente = c.id_cliente 
            WHERE v.id_venda = %s
        """, (id_venda,))
        
        resultado = cur.fetchone()
        
        if not resultado:
            cur.close()
            conn.close()
            return None
        
        cliente = Cliente(resultado[5], resultado[6], resultado[7], resultado[8])
        venda = Venda(resultado[0], cliente, self.servico_pagamento)
        venda.status = resultado[4]
        venda.valor_total = resultado[3]
        venda.data_hora = resultado[2]
        
        cur.execute("""
            SELECT i.*, p.nome 
            FROM itens_venda i 
            JOIN produtos p ON i.id_produto = p.id_produto 
            WHERE i.id_venda = %s
        """, (id_venda,))
        
        itens = cur.fetchall()
        cur.close()
        conn.close()
        
        for item in itens:
            produto = Produto(item[2], item[5], item[4], 0)
            from models.ItemVenda import ItemVenda
            item_venda = ItemVenda(produto, item[3])
            item_venda.preco = item[4]
            venda.itens.append(item_venda)
        
        return venda
    
    def cancelar_venda_pendente(self, id_venda: int) -> bool:
        venda = self.buscar_venda(id_venda)
        if not venda:
            print(f"Venda ID {id_venda} nao encontrada")
            return False
        
        if venda.status != "pendente":
            print(f"Venda ID {id_venda} nao esta pendente (status: {venda.status})")
            return False
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT id_produto, quantidade FROM itens_venda WHERE id_venda = %s", (id_venda,))
        itens = cur.fetchall()
        
        for item in itens:
            cur.execute("UPDATE produtos SET estoque = estoque + %s WHERE id_produto = %s", (item[1], item[0]))
        
        cur.execute("UPDATE vendas SET status = 'cancelada' WHERE id_venda = %s", (id_venda,))
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"Venda ID {id_venda} cancelada e estoque restaurado")
        return True

    def adicionar_item_venda(self, id_venda: int, id_produto: int, quantidade: int) -> bool:
        venda = self.buscar_venda(id_venda)
        produto = self.buscar_produto(id_produto)
        
        if not venda:
            print(f"Venda ID {id_venda} nao encontrada")
            return False
        
        if not produto:
            print(f"Produto ID {id_produto} nao encontrado")
            return False
        
        if produto.estoque < quantidade:
            print(f"Estoque insuficiente de {produto.nome}")
            return False
        
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("UPDATE produtos SET estoque = estoque - %s WHERE id_produto = %s", (quantidade, id_produto))
        
        cur.execute("""
            INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario) 
            VALUES (%s, %s, %s, %s)
        """, (id_venda, id_produto, quantidade, produto.preco_unitario))
        
        cur.execute("""
            UPDATE vendas 
            SET valor_total = (SELECT SUM(quantidade * preco_unitario) FROM itens_venda WHERE id_venda = %s)
            WHERE id_venda = %s
        """, (id_venda, id_venda))
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"{quantidade}x {produto.nome} adicionado a venda {id_venda}")
        return True

    def finalizar_venda(self, id_venda: int, dados_cartao: Dict) -> bool:
        venda = self.buscar_venda(id_venda)
        
        if not venda:
            print(f"Venda ID {id_venda} nao encontrada")
            return False
        
        if not venda.itens:
            print(f"Venda ID {id_venda} nao tem itens")
            return False
        
        if venda.status != "pendente":
            print(f"Venda ID {id_venda} ja esta {venda.status}")
            return False
        
        id_transacao = self.servico_pagamento.processar_pagamento(venda.valor_total, dados_cartao)
        
        if id_transacao:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
                "UPDATE vendas SET status = 'pago', id_transacao_pagamento = %s WHERE id_venda = %s",
                (id_transacao, id_venda)
            )
            conn.commit()
            cur.close()
            conn.close()
            print(f"Venda {id_venda} finalizada com sucesso! Transacao: {id_transacao}")
            return True
        else:
            print(f"Falha no pagamento da venda {id_venda}")
            return False
    
    def get_total_clientes(self) -> int:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM clientes")
        total = cur.fetchone()[0]
        cur.close()
        conn.close()
        return total
    
    def get_total_vendas_finalizadas(self) -> int:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM vendas WHERE status = 'pago'")
        total = cur.fetchone()[0]
        cur.close()
        conn.close()
        return total
    
    def get_total_arrecadado(self) -> float:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COALESCE(SUM(valor_total), 0) FROM vendas WHERE status = 'pago'")
        total = cur.fetchone()[0]
        cur.close()
        conn.close()
        return float(total)
    
    @property
    def clientes(self):
        return {c.id_cliente: c for c in self.listar_clientes()}
    
    @property
    def produtos(self):
        return {p.id_produto: p for p in self.listar_produtos()}
    
    @property
    def vendas(self):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id_venda FROM vendas")
        ids = cur.fetchall()
        cur.close()
        conn.close()
        
        vendas_dict = {}
        for id_venda in ids:
            venda = self.buscar_venda(id_venda[0])
            if venda:
                vendas_dict[venda.id_pedido] = venda
        return vendas_dict