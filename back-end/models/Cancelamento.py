from datetime import datetime

class Cancelamento:
    """Entidade Cancelamento"""
    
    def __init__(self, id_venda, id_cliente, motivo, id_cancelamento=None):
        self.id_cancelamento = id_cancelamento
        self.id_venda = id_venda
        self.id_cliente = id_cliente
        self.motivo = motivo
        self.data_cancelamento = datetime.now()
    
    def to_dict(self):
        return {
            'id_cancelamento': self.id_cancelamento,
            'id_venda': self.id_venda,
            'id_cliente': self.id_cliente,
            'motivo': self.motivo,
            'data_cancelamento': self.data_cancelamento.isoformat()
        }