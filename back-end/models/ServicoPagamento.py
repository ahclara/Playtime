class ServicoPagamento:
    """Serviço de Pagamento"""
    
    def __init__(self):
        self.ultima_transacao = None
    
    def processar_pagamento(self, valor, dados_cartao=None):
        """Pagamento sempre aprovado, pois o serviço não é real"""
        import uuid
        self.ultima_transacao = f"TXN_{uuid.uuid4().hex[:8].upper()}"
        print(f"Pagamento aprovado! Transação: {self.ultima_transacao}")
        return True
    
    def estornar_pagamento(self, id_transacao):
        return True if id_transacao else False