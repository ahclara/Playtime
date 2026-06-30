from repositories.ClienteRepository import ClienteRepository

class AtualizarPerfilClienteUseCase:
    """Caso de Uso: Atualizar Perfil do Cliente"""
    
    def __init__(self, cliente_repository=None):
        self.cliente_repository = cliente_repository or ClienteRepository()
    
    def executar(self, id_cliente, dados_atualizacao):
        """Executa a atualização do perfil do cliente"""
        # Busca cliente
        cliente = self.cliente_repository.buscar_por_id(id_cliente)
        if not cliente:
            raise ValueError("Cliente não encontrado")
        
        # Atualiza perfil
        cliente.atualizar_perfil(
            nome=dados_atualizacao.get('nome'),
            email=dados_atualizacao.get('email'),
           
        )
        
        # Salva alterações
        cliente_atualizado = self.cliente_repository.atualizar(cliente)
        return cliente_atualizado.to_dict()