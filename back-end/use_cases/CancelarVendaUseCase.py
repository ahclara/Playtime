from repositories.VendaRepository import VendaRepository
from repositories.CancelamentoRepository import CancelamentoRepository
from models.Cancelamento import Cancelamento

class CancelarVendaUseCase:
    """Caso de Uso: Cancelar Venda"""
    
    def __init__(self, venda_repository=None, cancelamento_repository=None):
        self.venda_repository = venda_repository or VendaRepository()
        self.cancelamento_repository = cancelamento_repository or CancelamentoRepository()
    
    def executar(self, id_venda, motivo, id_cliente=None):
        """Executa o cancelamento de uma venda"""
        # Busca venda
        venda = self.venda_repository.buscar_por_id(id_venda)
        if not venda:
            raise ValueError("Venda não encontrada")
        
        # Verifica se venda pode ser cancelada
        if venda.status == 'cancelada':
            raise ValueError("Venda já está cancelada")
        
        # Cancelar venda 
        venda.cancelar()
        
        # Atualiza status da venda
        self.venda_repository.atualizar_status(id_venda, 'cancelada')
        
        # Registra cancelamento
        cancelamento = Cancelamento(id_venda, id_cliente, motivo)
        self.cancelamento_repository.criar(cancelamento)
        
        return {
            'mensagem': 'Venda cancelada com sucesso',
            'id_venda': id_venda,
            'status': 'cancelada'
        }