from repositories.VendaRepository import VendaRepository
from repositories.ProdutoRepository import ProdutoRepository
from models.Venda import Venda
from models.Produto import Produto

class RealizarVendaUseCase:
    """Caso de Uso: Realizar Venda"""
    
    def __init__(self, venda_repository=None, produto_repository=None):
        self.venda_repository = venda_repository or VendaRepository()
        self.produto_repository = produto_repository or ProdutoRepository()
    
    def executar(self, dados_venda):
        """Executa a realização de uma venda"""
        # Valida dados
        id_cliente = dados_venda.get('id_cliente')
        if not id_cliente:
            raise ValueError("ID do cliente é obrigatório")
        
        metodo_pagamento = dados_venda.get('metodo_pagamento', 'dinheiro')
        itens_data = dados_venda.get('itens', [])
        
        if not itens_data:
            raise ValueError("Venda deve ter pelo menos um item")
        
        # Cria venda
        venda = Venda(id_cliente=id_cliente, metodo_pagamento=metodo_pagamento)
        
        # Adiciona itens
        for item_data in itens_data:
            produto = self.produto_repository.buscar_por_id(item_data['id_produto'])
            if not produto:
                raise ValueError(f"Produto {item_data['id_produto']} não encontrado")
            
            # Verifica disponibilidade
            if not produto.verificar_disponibilidade(item_data['quantidade']):
                raise ValueError(f"Estoque insuficiente para {produto.nome}")
            
            venda.adicionar_item(produto, item_data['quantidade'])
        
        # Finaliza venda
        venda.finalizar(metodo_pagamento)
        
        # Salva venda
        venda_salva = self.venda_repository.criar(venda)
        return venda_salva.to_dict()