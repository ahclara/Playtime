from __future__ import annotations
import time 
from SistemaVendas import SistemaVendas
from Cliente import Cliente
from Produto import Produto
from Venda import Venda

sistema = SistemaVendas()
    
def clear_screen():
    import os
    os.system('cls' if os.name == 'nt' else 'clear') 

def fazer_cadastro_cliente():
    print("\n______Cadastro de Novo Cliente______")
    nome = input("Nome: ")
    cpf = input("CPF: ")
    email = input("E-mail: ")
    
    cliente = sistema.cadastrar_cliente(nome=nome, cpf=cpf, email=email)
    print(f"Cliente cadastrado com sucesso! ID: {cliente.id_cliente}")

def listar_clientes():
    print("\n______Lista de Clientes______")
    if not sistema.clientes:
        print("Nenhum cliente cadastrado.")
        return
    print("ID | Nome | CPF | Email")
    print("_" * 60)
    for cliente in sistema.clientes.values():
        print(f"{cliente.id_cliente} | {cliente.nome} | {cliente.cpf} | {cliente.email}")

def atualizar_cadastro_cliente():
    print("\n______Atualizar Cadastro de Cliente______")
    listar_clientes()
    id_cliente_str = input("ID do cliente para atualizar: ")
    try:
        id_cliente = int(id_cliente_str)
        cliente = sistema.buscar_cliente(id_cliente)
        if cliente:
            print(f"Atualizando Cliente: {cliente.nome}")
            novo_nome = input(f"Novo Nome (Atual: {cliente.nome}, Deixe em branco para manter): ")
            novo_email = input(f"Novo E-mail (Atual: {cliente.email}, Deixe em branco para manter): ")
            
            sistema.atualizar_cliente(id_cliente, novo_nome if novo_nome else None, novo_email if novo_email else None)
        else:
            print("Cliente não encontrado.")
    except ValueError:
        print("ID inválido.")

def deletar_cliente():
    print("\n______Deletar Cliente______")
    listar_clientes()
    id_cliente_str = input("ID do cliente para DELETAR: ")
    try:
        id_cliente = int(id_cliente_str)
        if id_cliente == 1:
            print("Não é permitido deletar o cliente de teste ID 1.")
            return
            
        confirma = input(f"Tem certeza que deseja DELETAR o cliente {id_cliente}? (S/N): ").upper()
        if confirma == 'S':
            sistema.deletar_cliente(id_cliente)
        else:
            print("Operação cancelada.")
    except ValueError:
        print("ID inválido.")

def cadastrar_produto():
    print("\n______Cadastrar Novo Produto______")
    nome = input("Nome: ")
    try:
        preco = float(input("Preço Unitário: "))
        estoque = int(input("Estoque Inicial: "))
        
        if preco <= 0 or estoque < 0:
            print("ERRO: Preço deve ser positivo e Estoque não pode ser negativo.")
            return
            
        sistema.cadastrar_produto(nome, preco, estoque)
    except ValueError:
        print("ERRO: Preço ou Estoque inválido.")

def consultar_produto():
    print("\n______Consultar Produtos______")
    if not sistema.produtos:
        print("Nenhum produto cadastrado.")
        return

    print("ID | Nome | Preço | Estoque")
    print("_" * 60)
    for prod in sistema.listar_produtos():
        detalhes = prod.consultar_detalhes()
        print(f"{detalhes['ID']} | {detalhes['Nome']} | R${detalhes['Preço Unitário']:.2f} | {detalhes['Estoque']}")

def atualizar_estoque_produto():
    print("\n______Atualizar Estoque______")
    consultar_produto()
    prod_id_str = input("ID do produto para ajustar o estoque (ou '0' para Voltar): ")
    if prod_id_str == '0':
        return

    try:
        prod_id = int(prod_id_str)
        produto = sistema.buscar_produto(prod_id)
        if not produto:
            print("ERRO: ID de Produto não encontrado.")
            return

        print(f"Produto selecionado: {produto.nome}. Estoque atual: {produto.estoque}")
        ajuste = int(input("Digite a quantidade de ajuste (+ para adicionar, - para remover): "))
        
        produto.atualizar_estoque(ajuste) 
    except ValueError:
        print("ERRO: ID ou ajuste inválido.")

def atualizar_detalhes_produto():
    print("\n______Alterar Detalhes de Produto______")
    consultar_produto()
    prod_id_str = input("ID do produto para alterar: ")
    try:
        prod_id = int(prod_id_str)
        produto = sistema.buscar_produto(prod_id)
        if produto:
            print(f"Produto selecionado: {produto.nome}")
            novo_nome = input(f"Novo Nome (Atual: {produto.nome}, Deixe em branco para manter): ")
            novo_preco_str = input(f"Novo Preço (Atual: R${produto.preco_unitario:.2f}, Deixe em branco para manter): ")
            
            novo_preco = float(novo_preco_str) if novo_preco_str else None
            
            sistema.atualizar_detalhes_produto(prod_id, novo_nome if novo_nome else None, novo_preco)
        else:
            print("Produto não encontrado.")
    except ValueError:
        print("ID ou Preço inválido.")

def deletar_produto():
    print("\n______Deletar Produto______")
    consultar_produto()
    prod_id_str = input("ID do produto para DELETAR: ")
    try:
        prod_id = int(prod_id_str)
        confirma = input(f"Tem certeza que deseja DELETAR o produto {prod_id}? (S/N): ").upper()
        if confirma == 'S':
            sistema.deletar_produto(prod_id)
        else:
            print("Operação cancelada.")
    except ValueError:
        print("ID inválido.")

def realizar_venda():
    print("\n______Iniciar Compra de Produto______")

    listar_clientes()
    id_cliente_str = input("Digite o ID do Cliente para a compra: ")
    try:
        id_cliente = int(id_cliente_str)
        venda_atual = sistema.iniciar_nova_venda(id_cliente)
        
        if not venda_atual:
            return

        while True:
            print("\n Adicionar Itens ")
            consultar_produto() 
            
            prod_id_str = input("Digite o ID do produto (ou 'F' para Finalizar compra): ").upper()
            if prod_id_str == 'F':
                break

            try:
                prod_id = int(prod_id_str)
                produto = sistema.buscar_produto(prod_id)
                if not produto:
                    print("ERRO: ID de Produto não encontrado.")
                    continue

                quantidade = int(input(f"Quantidade de '{produto.nome}' (Estoque: {produto.estoque}): "))
                if quantidade <= 0:
                    print("ERRO: Quantidade deve ser positiva.")
                    continue
                
                venda_atual.adicionar_item(produto, quantidade) 

            except ValueError:
                print("ERRO: Entrada inválida. Tente novamente.")
                continue

        if not venda_atual.itens:
            print("Nenhum item adicionado. Compra cancelada e removida do registro.")
            if venda_atual.id_pedido in sistema.vendas:
                 del sistema.vendas[venda_atual.id_pedido]
            return

        print(f"\nTotal da Compra {venda_atual.id_pedido}: R${venda_atual.calcular_total():.2f}")
        
        pagar = input("Deseja prosseguir com o pagamento? (S/N): ").upper()
        if pagar == 'S':
            dados_cartao = {"numero": "4111...", "cvv": input("Simulação CVV: ")} 
            venda_atual.finalizar_venda(dados_cartao)
        else:
            print("Pagamento não efetuado. Venda permanece pendente.")

    except ValueError:
        print("ERRO: ID de Cliente inválido.")

def consultar_venda():
    print("\n______Consultar Vendas______")
    if not sistema.vendas:
        print("Nenhuma venda finalizada/registrada.")
        return
        
    for venda in sistema.vendas.values():
        print("=" * 60)
        print(venda)

def gerenciar_cadastro():
    while True:
        clear_screen()
        print("\n Gerenciar Cadastro")
        print("1. Cadastrar Novo Cliente")
        print("2. Atualizar Cadastro de Cliente")
        print("3. Listar Clientes")
        print("0. Voltar")
        opcao = input("Escolha uma opção: ")
        
        if opcao == '1':
            fazer_cadastro_cliente()
        elif opcao == '2':
            atualizar_cadastro_cliente()
        elif opcao == '3':
            listar_clientes()
        elif opcao == '0':
            break
        else:
            print("Opção inválida.")
        input("Pressione Enter para continuar... :)")

def menu_cliente():
    while True:
        clear_screen()
        print("·····························")
        print("Menu Cliente")
        print("·····························")
        print("1. Fazer Cadastro")
        print("2. Comprar Produto")
        print("3. Consultar Produtos")
        print("0. Voltar ao Menu Principal")
        
        opcao = input("Escolha uma opção: ")
        
        if opcao == '1':
            fazer_cadastro_cliente()
        elif opcao == '2':
            realizar_venda()
        elif opcao == '3':
            consultar_produto()
        elif opcao == '0':
            break
        else:
            print("Opção inválida.")
        input("Pressione Enter para continuar... :)")

def menu_vendedor():
    while True:
        clear_screen()
        print("·····························")
        print("Menu Vendedor")
        print("·····························")
        print("1. Gerenciar Cadastro de Clientes")
        print("2. Consultar Produtos")
        print("3. Realizar Venda")
        print("0. Voltar ao Menu Principal")
        
        opcao = input("Escolha uma opção: ")
        
        if opcao == '1':
            gerenciar_cadastro()
        elif opcao == '2':
            consultar_produto()
        elif opcao == '3':
            realizar_venda()
        elif opcao == '0':
            break
        else:
            print("Opção inválida.")
        input("Pressione Enter para continuar... :)")

def menu_gerente():
    while True:
        clear_screen()
        print("·····························")
        print("Menu Gerente")
        print("·····························")
        print("1. Gerenciar Produtos")
        print("2. Gerenciar Estoque")
        print("3. Gerenciar Clientes")
        print("4. Consultar Vendas")
        print("5. Cancelar Venda Pendente")
        print("6. Gerar Relatórios")
        print("0. Voltar ao Menu Principal")
        
        opcao = input("Escolha uma opção: ")
        
        if opcao == '1':
            gerenciar_produto_menu()
        elif opcao == '2':
            atualizar_estoque_produto()
        elif opcao == '3':
            gerenciar_cadastro_completo()
        elif opcao == '4':
            consultar_venda()
        elif opcao == '5':
            cancelar_venda_menu()
        elif opcao == '6':
            gerar_relatorios()
        elif opcao == '0':
            break
        else:
            print("Opção inválida.")
        input("Pressione Enter para continuar... :)")

def gerenciar_produto_menu():
    while True:
        clear_screen()
        print("\nGerenciar Produtos")
        print("1. Cadastrar Novo Produto")
        print("2. Consultar Produtos")
        print("3. Alterar Detalhes de Produto")
        print("4. Deletar Produto")
        print("0. Voltar")
        opcao = input("Escolha uma opção: ")
        
        if opcao == '1':
            cadastrar_produto()
        elif opcao == '2':
            consultar_produto()
        elif opcao == '3':
            atualizar_detalhes_produto()
        elif opcao == '4':
            deletar_produto()
        elif opcao == '0':
            break
        else:
            print("Opção inválida.")
        input("Pressione Enter para continuar... :)")

def gerenciar_cadastro_completo():
    while True:
        clear_screen()
        print("\n Gerenciar Cadastro")
        print("1. Cadastrar Novo Cliente")
        print("2. Listar Clientes")
        print("3. Atualizar Cadastro de Cliente")
        print("4. Deletar Cliente")
        print("0. Voltar")
        opcao = input("Escolha uma opção: ")
        
        if opcao == '1':
            fazer_cadastro_cliente()
        elif opcao == '2':
            listar_clientes()
        elif opcao == '3':
            atualizar_cadastro_cliente()
        elif opcao == '4':
            deletar_cliente()
        elif opcao == '0':
            break
        else:
            print("Opção inválida.")
        input("Pressione Enter para continuar... :)")

def cancelar_venda_menu():
    print("\n______Cancelar Venda Pendente______")
    
    vendas_pendentes = [v for v in sistema.vendas.values() if v.status == 'pendente']
    if not vendas_pendentes:
        print("Nenhuma venda pendente para cancelar.")
        return

    print("Vendas Pendentes:")
    for v in vendas_pendentes:
        print(f"ID: {v.id_pedido} | Cliente: {v.cliente.nome} | Total: R${v.valor_total:.2f}")

    id_venda_str = input("ID da venda para cancelar (ou '0' para Voltar): ")
    if id_venda_str == '0':
        return
        
    try:
        id_venda = int(id_venda_str)
        sistema.cancelar_venda_pendente(id_venda)
    except ValueError:
        print("ID inválido.")

def gerar_relatorios():
    print("\n______Gerar Relatórios______")
    
    vendas_pagas = [v for v in sistema.vendas.values() if v.status == 'pago']
    total_vendas = sum(v.valor_total for v in vendas_pagas)
    produtos_em_estoque = sum(p.estoque for p in sistema.produtos.values())
    
    print(f"Número de Clientes Cadastrados: {len(sistema.clientes)}")
    print(f"Número de Vendas Finalizadas: {len(vendas_pagas)}")
    print(f"Total Arrecadado: R${total_vendas:.2f}")
    print(f"Total de Produtos em Estoque: {produtos_em_estoque}")

def main_menu():
    while True:
        clear_screen()
        print("····································")
        print(" Sistema de Loja de Brinquedos")
        print("····································")
        print("Selecione seu Perfil de Acesso:")
        print("1. Cliente")
        print("2. Vendedor")
        print("3. Gerente")
        print("0. Sair do Sistema")
        
        perfil = input("Digite o número do perfil: ")
        
        if perfil == '1':
            menu_cliente()
        elif perfil == '2':
            menu_vendedor()
        elif perfil == '3':
            menu_gerente()
        elif perfil == '0':
            print("\nEncerrando o Sistema. Até logo! :))")
            break
        else:
            print("Opção de perfil inválida. Tente novamente.")
            time.sleep(1)

if __name__ == "__main__":
    main_menu()