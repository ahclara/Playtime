from repositories.ProdutoRepository import ProdutoRepository

class ConsultarProdutoUseCase:
    """Caso de Uso: Consultar Produto"""
    
    def __init__(self, produto_repository=None):
        self.produto_repository = produto_repository or ProdutoRepository()
    
    def executar(self, filtro=None):
        """Executa a consulta de produtos"""
        produtos = self.produto_repository.listar_todos(filtro)
        return [produto.to_dict() for produto in produtos]