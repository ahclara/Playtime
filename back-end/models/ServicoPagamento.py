from __future__ import annotations
from datetime import datetime
from typing import Dict, Optional 

class ServicoPagamento:
    def __init__(self, url_api: str, token_autenticacao: str):
        self.url_api = url_api 
        self.token_autenticacao = token_autenticacao

    def processar_pagamento(self, valor: float, dados_cartao: Dict) -> Optional[str]:
        print(f"Processando pagamento de R${valor:.2f}...")
        if valor > 0:
            id_transacao = f"TRANS_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            print(f"Pagamento aprovado! ID: {id_transacao}")
            return id_transacao
        else:
            print("Erro: Valor inválido")
            return None 

    def estornar_pagamento(self, id_transacao: str) -> bool:
        print(f"Estornando transação: {id_transacao}...")
        if id_transacao.startswith("TRANS_"):
            print("Estorno realizado com sucesso")
            return True
        return False