from __future__ import annotations
import time
import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.SistemaVendas import SistemaVendas

sistema = SistemaVendas()
TOKEN = None
USUARIO_ATUAL = None

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def fazer_login():
    """Faz login"""
    global TOKEN, USUARIO_ATUAL
    
    print("\n" + "-"*50)
    print("       LOGIN")
    print("-"*50)
    print("\nDigite suas credenciais para acessar o sistema.")
    print("-"*50)
    
    email = input("\n Email: ")
    senha = input(" Senha: ")
    
    try:
        response = requests.post(
            "http://localhost:5000/api/login",
            json={"email": email, "senha": senha}
        )
        
        if response.status_code == 200:
            dados = response.json()
            TOKEN = dados['token']
            USUARIO_ATUAL = dados['usuario']
            print(f"\n Login realizado com sucesso!")
            print(f" Bem-vindo(a), {USUARIO_ATUAL['nome']}!")
            print(f" Perfil: {USUARIO_ATUAL['perfil'].upper()}")
            input("\nPressione Enter para continuar...")
            return True
        else:
            erro = response.json().get('erro', 'Credenciais inválidas')
            print(f"\n Erro ao fazer login: {erro}")
            input("\nPressione Enter para continuar...")
            return False
    except requests.exceptions.ConnectionError:
        print("\n Erro: Servidor não está rodando!")
        print("   Execute 'python app.py' em outro terminal")
        input("\nPressione Enter para continuar...")
        return False
    except Exception as e:
        print(f"\n Erro ao conectar ao servidor: {e}")
        input("\nPressione Enter para continuar...")
        return False

def fazer_logout():
    global TOKEN, USUARIO_ATUAL
    TOKEN = None
    USUARIO_ATUAL = None
    print("\n Logout realizado com sucesso!")
    input("Pressione Enter para continuar...")

def cadastrar_usuario():
    """Cadastro de novo usuário"""
    print("\n" + "-"*50)
    print("       CADASTRO DE USUÁRIO")
    print("-"*50)
    
    nome = input("Nome completo: ")
    cpf = input("CPF: ")
    email = input("Email: ")
    senha = input("Senha: ")
    
    try:
        response = requests.post(
            "http://localhost:5000/api/registrar",
            json={
                "nome": nome,
                "cpf": cpf,
                "email": email,
                "senha": senha,
                "perfil": "cliente"
            }
        )
        
        if response.status_code == 201:
            print("\n Cadastro realizado com sucesso!")
            print(" Agora faça login para acessar o sistema.")
            input("\nPressione Enter para continuar...")
            return True
        else:
            erro = response.json().get('erro', 'Erro desconhecido')
            print(f"\n Erro ao cadastrar: {erro}")
            input("\nPressione Enter para continuar...")
            return False
    except Exception as e:
        print(f"\n Erro: {e}")
        input("\nPressione Enter para continuar...")
        return False

# --------------- MENU PRINCIPAL ---------------

def main_menu():
    while True:
        clear_screen()
        print("\n" + "-"*50)
        print("       PLAYTIME - SISTEMA DE LOJA")
        print("-"*50)
        
        if USUARIO_ATUAL:
            print(f"\n Logado como: {USUARIO_ATUAL['nome']}")
            print(f" Perfil: {USUARIO_ATUAL['perfil'].upper()}")
        else:
            print("\n Faça login para acessar o sistema")
        
        print("\n" + "-"*50)
        
        if not USUARIO_ATUAL:
            print("  1. Login")
            print("  2. Cadastrar-se")
            print("  0. Sair")
        else:
            perfil = USUARIO_ATUAL['perfil']
            
            if perfil == 'cliente':
                print("   MENU PRINCIPAL")
                print("  1. Comprar Produtos")
                print("  2. Consultar Produtos")
                print("  3. Minhas Compras")
                print("  4. Finalizar Compra Pendente")  
            elif perfil == 'vendedor':
                print("   MENU PRINCIPAL")
                print("  1. Realizar Venda")
                print("  2. Consultar Produtos")
                print("  3. Listar Clientes")
                print("  4. Consultar Vendas")
            elif perfil == 'gerente':
                print("   MENU PRINCIPAL")
                print("  1. Gerenciar Produtos")
                print("  2. Atualizar Estoque")
                print("  3. Gerenciar Clientes")
                print("  4. Consultar Vendas")
                print("  5. Cancelar Venda")
                print("  6. Gerar Relatórios")
            
            print("-"*50)
            print("  9.  Logout")
            print("  0.  Sair")
        
        opcao = input("\n Escolha uma opção: ")
        
        if not USUARIO_ATUAL:
            if opcao == '1':
                fazer_login()
            elif opcao == '2':
                cadastrar_usuario()
            elif opcao == '0':
                print("\n Encerrando o Sistema. Até logo!")
                break
            else:
                print(" Opção inválida!")
                time.sleep(1)
        else:
            perfil = USUARIO_ATUAL['perfil']
            
            if perfil == 'cliente':
                if opcao == '1':
                    comprar_produto()
                elif opcao == '2':
                    consultar_produtos()
                elif opcao == '3':
                    ver_minhas_compras()
                elif opcao == '4':  
                    finalizar_compra_pendente()  
                elif opcao == '9':
                    fazer_logout()
                elif opcao == '0':
                    print("\n Encerrando o Sistema. Até logo!")
                    break
                else:
                    print(" Opção inválida!")
                    time.sleep(1)
            
            elif perfil == 'vendedor':
                if opcao == '1':
                    realizar_venda()
                elif opcao == '2':
                    consultar_produtos()
                elif opcao == '3':
                    listar_clientes()
                elif opcao == '4':
                    consultar_vendas()
                elif opcao == '9':
                    fazer_logout()
                elif opcao == '0':
                    print("\n Encerrando o Sistema. Até logo!")
                    break
                else:
                    print(" Opção inválida!")
                    time.sleep(1)
            
            elif perfil == 'gerente':
                if opcao == '1':
                    gerenciar_produtos()
                elif opcao == '2':
                    atualizar_estoque()
                elif opcao == '3':
                    gerenciar_clientes()
                elif opcao == '4':
                    consultar_vendas()
                elif opcao == '5':
                    cancelar_venda()
                elif opcao == '6':
                    gerar_relatorios()
                elif opcao == '9':
                    fazer_logout()
                elif opcao == '0':
                    print("\n Encerrando o Sistema. Até logo!")
                    break
                else:
                    print(" Opção inválida!")
                    time.sleep(1)

#--------------- FUNÇÕES DO SISTEMA ---------------

def consultar_produtos():
    """Lista todos os produtos"""
    print("\n" + "-"*60)
    print("      CONSULTAR PRODUTOS")
    print("-"*60)
    
    try:
        response = requests.get(
            "http://localhost:5000/produtos",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            produtos = response.json()
            if not produtos:
                print("Nenhum produto cadastrado.")
                input("\nPressione Enter para continuar...")
                return
            
            print(f"{'ID':<5} | {'Nome':<30} | {'Preço':<10} | {'Estoque':<10}")
            print("-"*60)
            for p in produtos:
                print(f"{p['id_produto']:<5} | {p['nome']:<30} | R${p['preco_unitario']:>8.2f} | {p['estoque']:<10}")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except Exception as e:
        print(f" Erro: {e}")
    
    input("\nPressione Enter para continuar...")

def comprar_produto():
    """Cliente compra produtos para si mesmo"""
    print("\n" + "-"*50)
    print("      REALIZAR COMPRA")
    print("-"*50)

    try:
        # Cliente compra para si mesmo
        id_cliente = USUARIO_ATUAL['id_cliente']
        print(f"\n Cliente: {USUARIO_ATUAL['nome']}")
        print(f"   ID: {id_cliente}")
        print("\n" + "-"*40)
        
        # Busca produtos
        response = requests.get(
            "http://localhost:5000/produtos",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        if response.status_code != 200:
            print(" Erro ao buscar produtos")
            input("\nPressione Enter para continuar...")
            return
        
        produtos = response.json()
        if not produtos:
            print("Nenhum produto disponível.")
            input("\nPressione Enter para continuar...")
            return
        
        itens = []
        while True:
            print("\n" + "-"*40)
            print("     ADICIONAR ITENS")
            print("-"*40)
            print(f"{'ID':<5} | {'Nome':<30} | {'Preço':<10} | {'Estoque':<10}")
            print("-"*60)
            for p in produtos:
                print(f"{p['id_produto']:<5} | {p['nome']:<30} | R${p['preco_unitario']:>8.2f} | {p['estoque']:<10}")
            
            prod_id = input("\nID do produto (ou 'F' para Finalizar): ").upper()
            if prod_id == 'F':
                break
            
            try:
                prod_id = int(prod_id)
                quantidade = int(input("Quantidade: "))
                
                produto = next((p for p in produtos if p['id_produto'] == prod_id), None)
                if not produto:
                    print(" Produto não encontrado.")
                    continue
                
                if quantidade > produto['estoque']:
                    print(f" Estoque insuficiente. Disponível: {produto['estoque']}")
                    continue
                
                itens.append({"id_produto": prod_id, "quantidade": quantidade})
                print(f" Item adicionado! Produto: {produto['nome']} x{quantidade}")
                
            except ValueError:
                print(" Entrada inválida.")
                continue
        
        if not itens:
            print("\n Nenhum item adicionado. Compra cancelada.")
            input("\nPressione Enter para continuar...")
            return
        
        # Calcula total
        total = 0
        for item in itens:
            produto = next(p for p in produtos if p['id_produto'] == item['id_produto'])
            total += produto['preco_unitario'] * item['quantidade']
        
        print(f"\nTotal da Compra: R${total:.2f}")
        
        pagar = input("Deseja finalizar a compra agora? (S/N): ").upper()
        
        if pagar == 'S':
            # Cliente usa a rota /vendas/comprar 
            print(f"\n Finalizando compra...")
            response = requests.post(
                "http://localhost:5000/vendas/comprar",
                json={"itens": itens},
                headers={"Authorization": f"Bearer {TOKEN}"}
            )
            
            if response.status_code == 201:
                venda = response.json()
                venda_id = venda.get('id_venda')
                print(f" Compra criada com ID: {venda_id}")
                
                # Agora finalizar a venda
                response = requests.post(
                    f"http://localhost:5000/vendas/{venda_id}/finalizar",
                    json={},
                    headers={"Authorization": f"Bearer {TOKEN}"}
                )
                
                # Depois de finalizar a venda
                if response.status_code == 200:
                    resultado = response.json()
                    valor = resultado.get('valor_total', 0)
                    print(f" Compra finalizada com sucesso!")
                    print(f" Status: {resultado.get('status')}")
                    print(f" Total: R$ {valor:.2f}")
                else:
                    erro = response.json().get('erro', 'Erro desconhecido')
                    print(f" Falha ao finalizar: {erro}")
        else:
            # Salva como pendente
            print(f"\n Salvando compra como pendente...")
            response = requests.post(
                "http://localhost:5000/vendas/pendente",
                json={"id_cliente": id_cliente, "itens": itens},
                headers={"Authorization": f"Bearer {TOKEN}"}
            )
            
            if response.status_code == 201:
                resultado = response.json()
                print(f" Compra pendente salva com sucesso!")
                print(f" ID da compra: {resultado.get('id_venda')}")
                print(f" Status: {resultado.get('status')}")
                print(f" Total: R$ {resultado.get('valor_total', 0):.2f}")
                print(f"\n Para finalizar depois, use a opção 'Finalizar Compra Pendente' no menu.")
            else:
                erro = response.json().get('erro', 'Erro desconhecido')
                print(f" Falha ao salvar compra pendente: {erro}")
            
    except ValueError:
        print(" Valor inválido.")
    except Exception as e:
        print(f" Erro: {e}")
    input("\nPressione Enter para continuar...")
    
def finalizar_compra_pendente():
    """Finalizar uma compra pendente"""
    print("\n" + "-"*50)
    print("      FINALIZAR COMPRA PENDENTE")
    print("-"*50)
    
    try:
        # Busca vendas pendentes do cliente
        response = requests.get(
            "http://localhost:5000/compras/cliente",  
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code != 200:
            print(f" Erro ao buscar vendas: {response.json().get('erro', 'Erro desconhecido')}")
            input("\nPressione Enter para continuar...")
            return
        
        vendas = response.json()
        
        # Filtra apenas as pendentes
        vendas_pendentes = []
        for v in vendas:
            if v.get('status') == 'pendente':
                vendas_pendentes.append(v)
        
        if not vendas_pendentes:
            print("Nenhuma compra pendente encontrada.")
            input("\nPressione Enter para continuar...")
            return
        
        print("\n Compras pendentes:")
        print("-" * 40)
        for v in vendas_pendentes:
            venda_id = v.get('id_venda', 'N/A')
            valor = float(v.get('valor_total', 0))
            data = v.get('data_venda', 'N/A')
            print(f"  ID: {venda_id} | Data: {data} | Total: R$ {valor:.2f}")
        
        print("-" * 40)
        
        try:
            id_venda = input("\nID da compra para finalizar (ou 0 para cancelar): ").strip()
            
            if id_venda == '0' or id_venda == '':
                print("Operação cancelada.")
                input("\nPressione Enter para continuar...")
                return
            
            id_venda = int(id_venda)
            
            # Verifica se o ID existe na lista de pendentes
            existe = False
            for v in vendas_pendentes:
                if v.get('id_venda') == id_venda:
                    existe = True
                    break
            
            if not existe:
                print(f" Venda {id_venda} não encontrada ou não está pendente.")
                input("\nPressione Enter para continuar...")
                return
            
            # Finaliza venda
            response = requests.post(
                f"http://localhost:5000/vendas/{id_venda}/finalizar",
                json={},
                headers={"Authorization": f"Bearer {TOKEN}"}
            )
            
            if response.status_code == 200:
                resultado = response.json()
                print(f"\n Compra finalizada com sucesso!")
                print(f"ID: {id_venda}")
                print(f"Status: {resultado.get('status', 'pago')}")
                print(f"Total: R$ {resultado.get('valor_total', 0):.2f}")
            else:
                erro = response.json().get('erro', 'Erro desconhecido')
                print(f"\n Falha ao finalizar: {erro}")
                
        except ValueError:
            print(" ID inválido. Digite apenas números.")
            
    except Exception as e:
        print(f" Erro: {e}")
    
    input("\nPressione Enter para continuar...")

def listar_clientes():
    """Lista todos os clientes"""
    print("\n" + "-"*60)
    print("      LISTA DE CLIENTES")
    print("-"*60)
    
    try:
        response = requests.get(
            "http://localhost:5000/clientes",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            clientes = response.json()
            if not clientes:
                print("Nenhum cliente cadastrado.")
                input("\nPressione Enter para continuar...")
                return
            
            print(f"{'ID':<5} | {'Nome':<25} | {'CPF':<15} | {'Email':<25}")
            print("-"*75)
            for c in clientes:
                print(f"{c['id_cliente']:<5} | {c['nome']:<25} | {c['cpf']:<15} | {c['email']:<25}")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except Exception as e:
        print(f" Erro: {e}")
    
    input("\nPressione Enter para continuar...")

def consultar_vendas():
    """Lista todas as vendas"""
    print("\n" + "-"*60)
    print("      CONSULTAR VENDAS")
    print("-"*60)
    
    try:
        response = requests.get(
            "http://localhost:5000/vendas",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            vendas = response.json()
            if not vendas:
                print("Nenhuma venda registrada.")
                input("\nPressione Enter para continuar...")
                return
            
            for v in vendas:
                print("=" * 60)
                print(f"Venda #{v['id_venda']}")
                print(f"  Cliente: {v.get('nome_cliente', v.get('id_cliente', 'N/A'))}")
                print(f"  Data: {v['data_venda']}")
                print(f"  Status: {v['status']}")
                
                # Converte valor para float
                try:
                    valor_total = float(v.get('valor_total', 0))
                    print(f"  Total: R$ {valor_total:.2f}")
                except (ValueError, TypeError):
                    print(f"  Total: R$ {v.get('valor_total', 0)}")
                
                # Mostra itens
                itens = v.get('itens', [])
                if itens:
                    print(f"  Itens:")
                    for item in itens:
                        try:
                            subtotal = float(item.get('subtotal', 0))
                            nome_produto = item.get('nome_produto', 'Produto')
                            quantidade = item.get('quantidade', 0)
                            print(f"    - {nome_produto} x{quantidade} = R$ {subtotal:.2f}")
                        except (ValueError, TypeError):
                            print(f"    - {item.get('nome_produto', 'Produto')} x{item.get('quantidade', 0)}")
                else:
                    print(f"  Itens: Nenhum item encontrado")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except Exception as e:
        print(f" Erro: {e}")
    
    input("\nPressione Enter para continuar...")

def ver_minhas_compras():
    """Lista as compras do cliente logado"""
    print("\n" + "="*60)
    print("      MINHAS COMPRAS")
    print("="*60)
    
    try:
        response = requests.get(
            "http://localhost:5000/compras/cliente", 
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            vendas = response.json()
            if not vendas:
                print("Nenhuma compra encontrada.")
                input("\nPressione Enter para continuar...")
                return
            
            for v in vendas:
                print("=" * 60)
                print(f"Compra #{v['id_venda']}")
                print(f"  Data: {v['data_venda']}")
                print(f"  Status: {v['status']}")
                try:
                    valor = float(v.get('valor_total', 0))
                    print(f"  Total: R$ {valor:.2f}")
                except (ValueError, TypeError):
                    print(f"  Total: R$ {v.get('valor_total', 0)}")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except requests.exceptions.ConnectionError:
        print(" Erro: Servidor não está rodando!")
    except Exception as e:
        print(f" Erro: {e}")
    
    input("\nPressione Enter para continuar...")

def realizar_venda():
    """Realiza venda para um cliente"""
    print("\n" + "-"*50)
    print("      REALIZAR VENDA")
    print("-"*50)

    try:
        # Lista clientes
        response = requests.get(
            "http://localhost:5000/clientes",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        if response.status_code == 200:
            clientes = response.json()
            if not clientes:
                print("Nenhum cliente cadastrado.")
                input("\nPressione Enter para continuar...")
                return
            
            print("\nClientes disponíveis:")
            for c in clientes:
                print(f"  ID: {c['id_cliente']} - {c['nome']} ({c['email']})")
        else:
            print(" Erro ao listar clientes")
            input("\nPressione Enter para continuar...")
            return
        
        id_cliente = int(input("\nDigite o ID do Cliente: "))
        
        # Busca produtos
        response = requests.get(
            "http://localhost:5000/produtos",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        if response.status_code != 200:
            print(" Erro ao buscar produtos")
            input("\nPressione Enter para continuar...")
            return
        
        produtos = response.json()
        if not produtos:
            print("Nenhum produto disponível.")
            input("\nPressione Enter para continuar...")
            return
        
        itens = []
        while True:
            print("\n" + "-"*40)
            print("     ADICIONAR ITENS")
            print("-"*40)
            print(f"{'ID':<5} | {'Nome':<30} | {'Preço':<10} | {'Estoque':<10}")
            print("-"*60)
            for p in produtos:
                print(f"{p['id_produto']:<5} | {p['nome']:<30} | R${p['preco_unitario']:>8.2f} | {p['estoque']:<10}")
            
            prod_id = input("\nID do produto (ou 'F' para Finalizar): ").upper()
            if prod_id == 'F':
                break
            
            try:
                prod_id = int(prod_id)
                quantidade = int(input("Quantidade: "))
                
                produto = next((p for p in produtos if p['id_produto'] == prod_id), None)
                if not produto:
                    print(" Produto não encontrado.")
                    continue
                
                if quantidade > produto['estoque']:
                    print(f" Estoque insuficiente. Disponível: {produto['estoque']}")
                    continue
                
                itens.append({"id_produto": prod_id, "quantidade": quantidade})
                print(f" Item adicionado! Produto: {produto['nome']} x{quantidade}")
                
            except ValueError:
                print(" Entrada inválida.")
                continue
        
        if not itens:
            print("\n Nenhum item adicionado. Venda cancelada.")
            input("\nPressione Enter para continuar...")
            return
        
        # Calcula total
        total = 0
        for item in itens:
            produto = next(p for p in produtos if p['id_produto'] == item['id_produto'])
            total += produto['preco_unitario'] * item['quantidade']
        
        print(f"\nTotal da Venda: R${total:.2f}")
        
        pagar = input("Deseja finalizar a venda? (S/N): ").upper()
        if pagar != 'S':
            print(" Venda não finalizada.")
            input("\nPressione Enter para continuar...")
            return
        
        print(f"\n Finalizando venda...")
        
        # Chama a nova rota que cria e finaliza de uma vez
        response = requests.post(
            "http://localhost:5000/vendas/direta",
            json={"id_cliente": id_cliente, "itens": itens},
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            resultado = response.json()
            print(f" Venda finalizada com sucesso!")
            print(f" ID da venda: {resultado.get('id_venda')}")
            print(f" Status: {resultado.get('status')}")
            print(f" Total: R$ {resultado.get('valor_total', 0):.2f}")
            
            # Mostra itens
            if 'itens' in resultado:
                print(f"   Itens:")
                for item in resultado['itens']:
                    print(f"     - {item['nome']} x{item['quantidade']} = R$ {item['subtotal']:.2f}")
        else:
            erro = response.json().get('erro', 'Erro desconhecido')
            print(f" Falha ao finalizar: {erro}")
            
    except ValueError:
        print(" Valor inválido.")
    except Exception as e:
        print(f" Erro: {e}")
    input("\nPressione Enter para continuar...")

# --------------- GERENTE - PRODUTOS ---------------

def gerenciar_produtos():
    while True:
        clear_screen()
        print("\n" + "-"*40)
        print("      GERENCIAR PRODUTOS")
        print("-"*40)
        print("1. Cadastrar Produto")
        print("2. Listar Produtos")
        print("3. Atualizar Produto")
        print("4. Deletar Produto")
        print("0. Voltar")
        
        opcao = input("\nEscolha uma opção: ")
        
        if opcao == '1':
            cadastrar_produto()
        elif opcao == '2':
            consultar_produtos()
        elif opcao == '3':
            atualizar_produto()
        elif opcao == '4':
            deletar_produto()
        elif opcao == '0':
            break
        else:
            print("Opção inválida.")
            time.sleep(1)

def cadastrar_produto():
    print("\n" + "-"*50)
    print("      CADASTRAR PRODUTO")
    print("-"*50)
    
    nome = input("Nome: ")
    try:
        preco = float(input("Preço Unitário: "))
        estoque = int(input("Estoque: "))
        
        response = requests.post(
            "http://localhost:5000/produtos",
            json={"nome": nome, "preco_unitario": preco, "estoque": estoque},
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 201:
            print("Produto cadastrado com sucesso!")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except ValueError:
        print(" Valor inválido.")
    except Exception as e:
        print(f" Erro: {e}")
    input("\nPressione Enter para continuar...")

def atualizar_produto():
    """Atualiza um produto"""
    print("\n" + "-"*50)
    print("      ATUALIZAR PRODUTO")
    print("-"*50)
    
    consultar_produtos()
    print()
    
    try:
        id_produto = int(input("ID do produto para atualizar: "))
        
        # Busca produto atual
        response = requests.get(
            f"http://localhost:5000/produtos/{id_produto}",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code != 200:
            print(" Produto não encontrado!")
            input("\nPressione Enter para continuar...")
            return
        
        produto = response.json()
        print(f"\n Produto selecionado: {produto['nome']}")
        print(f"   Preço atual: R${produto['preco_unitario']:.2f}")
        print(f"   Estoque atual: {produto['estoque']}")
        
        print("\nDeixe em branco para manter o valor atual.")
        nome = input(f"Novo Nome (Atual: {produto['nome']}): ").strip()
        preco_str = input(f"Novo Preço (Atual: R${produto['preco_unitario']:.2f}): ").strip()
        
        dados = {}
        if nome:
            dados['nome'] = nome
        if preco_str:
            dados['preco_unitario'] = float(preco_str)
        
        if not dados:
            print(" Nenhum campo para atualizar.")
            input("\nPressione Enter para continuar...")
            return
        
        response = requests.put(
            f"http://localhost:5000/produtos/{id_produto}",
            json=dados,
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            print("Produto atualizado com sucesso!")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except ValueError:
        print(" Valor inválido.")
    except Exception as e:
        print(f" Erro: {e}")
    input("\nPressione Enter para continuar...")

def deletar_produto():
    """Deleta um produto"""
    print("\n" + "-"*50)
    print("      DELETAR PRODUTO")
    print("-"*50)
    
    consultar_produtos()
    print()
    
    try:
        id_produto = int(input("ID do produto para deletar: "))
        
        # Busca produto para confirmar informações
        response = requests.get(
            f"http://localhost:5000/produtos/{id_produto}",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code != 200:
            print(" Produto não encontrado!")
            input("\nPressione Enter para continuar...")
            return
        
        produto = response.json()
        confirmar = input(f"Tem certeza que deseja deletar o produto '{produto['nome']}' (ID {id_produto})? (S/N): ").upper()
        
        if confirmar != 'S':
            print("Operação cancelada.")
            input("\nPressione Enter para continuar...")
            return
        
        response = requests.delete(
            f"http://localhost:5000/produtos/{id_produto}",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            print("Produto deletado com sucesso!")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except ValueError:
        print(" ID inválido.")
    except Exception as e:
        print(f" Erro: {e}")
    input("\nPressione Enter para continuar...")

# --------------- GERENTE - ESTOQUE ---------------

def atualizar_estoque():
    """Atualiza estoque"""
    print("\n" + "="*50)
    print("      ATUALIZAR ESTOQUE")
    print("="*50)
    
    consultar_produtos()
    print()
    
    try:
        id_produto = int(input("ID do produto para ajustar estoque: "))
        
        # Busca produto para confirmar informações
        response = requests.get(
            f"http://localhost:5000/produtos/{id_produto}",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code != 200:
            print(" Produto não encontrado!")
            input("\nPressione Enter para continuar...")
            return
        
        produto = response.json()
        print(f"\n Produto: {produto['nome']}")
        print(f" Estoque atual: {produto['estoque']}")
        
        quantidade = int(input("\nQuantidade (+ para adicionar, - para remover): "))
        
        response = requests.patch(
            f"http://localhost:5000/produtos/{id_produto}/estoque",
            json={"quantidade": quantidade},
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            print(" Estoque atualizado com sucesso!")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except ValueError:
        print(" Valor inválido.")
    except Exception as e:
        print(f" Erro: {e}")
    input("\nPressione Enter para continuar...")

# --------------- GERENTE - CLIENTES ---------------

def gerenciar_clientes():
    while True:
        clear_screen()
        print("\n" + "-"*40)
        print("      GERENCIAR CLIENTES")
        print("-"*40)
        print("1. Cadastrar Cliente")
        print("2. Listar Clientes")
        print("3. Atualizar Cliente")      
        print("4. Deletar Cliente")        
        print("0. Voltar")
        
        opcao = input("\nEscolha uma opção: ")
        
        if opcao == '1':
            cadastrar_cliente()
        elif opcao == '2':
            listar_clientes()
        elif opcao == '3':
            atualizar_cliente()            
        elif opcao == '4':
            deletar_cliente()
        elif opcao == '0':
            break
        else:
            print("Opção inválida.")
            time.sleep(1)

def cadastrar_cliente():
    """Cadastrar um novo cliente"""
    print("\n" + "-"*50)
    print("      CADASTRAR CLIENTE")
    print("-"*50)
    
    nome = input("Nome: ")
    cpf = input("CPF: ")
    email = input("Email: ")
    senha = input("Senha: ")
    
    try:
        response = requests.post(
            "http://localhost:5000/api/registrar",
            json={
                "nome": nome,
                "cpf": cpf,
                "email": email,
                "senha": senha,
                "perfil": "cliente"
            },
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        # Verifica se a resposta é JSON
        if response.status_code == 201:
            try:
                resultado = response.json()
                print(f"\n Cliente cadastrado com sucesso!")
                print(f" ID: {resultado.get('cliente', {}).get('id_cliente', 'N/A')}")
                print(f" Nome: {resultado.get('cliente', {}).get('nome', 'N/A')}")
            except ValueError:
                print(f" Cliente cadastrado com sucesso! (Status: {response.status_code})")
        else:
            try:
                erro = response.json().get('erro', 'Erro desconhecido')
                print(f" Erro: {erro}")
            except ValueError:
                print(f" Erro: Status {response.status_code} - {response.text}")
    except requests.exceptions.ConnectionError:
        print(" Erro: Servidor não está rodando!")
        print("   Execute 'python app.py' em outro terminal")
    except Exception as e:
        print(f" Erro: {e}")
    input("\nPressione Enter para continuar...")

def atualizar_cliente():
    """Atualiza os dados de um cliente existente"""
    print("\n" + "-"*50)
    print("      ATUALIZAR CLIENTE")
    print("-"*50)
    
    listar_clientes()
    print()
    
    try:
        id_cliente = int(input("ID do cliente para atualizar: "))
        
        # Busca cliente para mostrar dados atuais
        response = requests.get(
            f"http://localhost:5000/clientes/{id_cliente}",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code != 200:
            print(" Cliente não encontrado!")
            input("\nPressione Enter para continuar...")
            return
        
        cliente = response.json()
        
        print(f"\n Cliente selecionado: {cliente['nome']}")
        print(f" CPF: {cliente['cpf']}")
        print(f" Email: {cliente['email']}")
        print(f" Ativo: {'Sim' if cliente.get('ativo', True) else 'Não'}")
        
        print("\n" + "-"*40)
        print("Deixe em branco para manter o valor atual.")
        print("-"*40)
        
        novo_nome = input(f"Novo Nome (Atual: {cliente['nome']}): ").strip()
        novo_email = input(f"Novo Email (Atual: {cliente['email']}): ").strip()
        novo_cpf = input(f"Novo CPF (Atual: {cliente['cpf']}): ").strip()
        
        # Prepara dados para enviar
        dados = {}
        if novo_nome:
            dados['nome'] = novo_nome
        if novo_email:
            dados['email'] = novo_email
        if novo_cpf:
            dados['cpf'] = novo_cpf
        
        if not dados:
            print(" Nenhum campo para atualizar.")
            input("\nPressione Enter para continuar...")
            return
        
        # Envia atualização
        response = requests.put(
            f"http://localhost:5000/clientes/{id_cliente}",
            json=dados,
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            print("\n Cliente atualizado com sucesso!")
            print(f" Nome: {response.json().get('nome')}")
            print(f" Email: {response.json().get('email')}")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
            
    except ValueError:
        print(" ID inválido.")
    except Exception as e:
        print(f" Erro: {e}")
    
    input("\nPressione Enter para continuar...")

def deletar_cliente():
    """Deleta um cliente"""
    print("\n" + "-"*50)
    print("      DELETAR CLIENTE")
    print("-"*50)
    
    listar_clientes()
    print()
    
    try:
        id_cliente = int(input("ID do cliente para deletar: "))
        
        # Busca cliente para confirmar informações
        response = requests.get(
            f"http://localhost:5000/clientes/{id_cliente}",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code != 200:
            print(" Cliente não encontrado!")
            input("\nPressione Enter para continuar...")
            return
        
        cliente = response.json()
        print(f"\n Cliente selecionado: {cliente['nome']}")
        print(f" Email: {cliente['email']}")
        print(f" CPF: {cliente['cpf']}")
        print(f" Ativo: {'Sim' if cliente.get('ativo', True) else 'Não'}")
        
        confirmar = input(f"\n Tem certeza que deseja deletar o cliente '{cliente['nome']}' (ID {id_cliente})? (S/N): ").upper()
        
        if confirmar != 'S':
            print("Operação cancelada.")
            input("\nPressione Enter para continuar...")
            return
        
        response = requests.delete(
            f"http://localhost:5000/clientes/{id_cliente}",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            print(" Cliente deletado com sucesso!")
        elif response.status_code == 400:
            erro = response.json().get('erro', 'Erro desconhecido')
            print(f" {erro}")
            if 'vendas' in erro:
                print(" Clientes com vendas não podem ser deletados.")
        else:
            print(f" Erro: {response.json().get('erro', 'Erro desconhecido')}")
    except ValueError:
        print(" ID inválido.")
    except Exception as e:
        print(f" Erro: {e}")
    input("\nPressione Enter para continuar...")

#--------------- GERENTE - VENDAS ---------------

def cancelar_venda():
    """Cancelar uma venda pendente"""
    print("\n" + "-"*50)
    print("      CANCELAR VENDA")
    print("-"*50)
    
    try:
        # Busca todas as vendas pendentes
        response = requests.get(
            "http://localhost:5000/vendas",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code != 200:
            print(f" Erro ao buscar vendas: {response.json().get('erro', 'Erro desconhecido')}")
            input("\nPressione Enter para continuar...")
            return
        
        vendas = response.json()
        
        # Filtra apenas as pendentes
        vendas_pendentes = []
        for v in vendas:
            if v.get('status') == 'pendente':
                vendas_pendentes.append(v)
        
        if not vendas_pendentes:
            print("Nenhuma venda pendente para cancelar.")
            input("\nPressione Enter para continuar...")
            return
        
        print("\n Vendas Pendentes:")
        print("-" * 50)
        for v in vendas_pendentes:
            venda_id = v.get('id_venda', 'N/A')
            cliente = v.get('nome_cliente', v.get('id_cliente', 'N/A'))
            valor = float(v.get('valor_total', 0))
            data = v.get('data_venda', 'N/A')
            print(f"  ID: {venda_id} | Cliente: {cliente} | Total: R$ {valor:.2f} | Data: {data}")
        
        print("-" * 50)
        
        try:
            id_venda = input("\nID da venda para cancelar (ou 0 para cancelar): ").strip()
            
            if id_venda == '0' or id_venda == '':
                print("Operação cancelada.")
                input("\nPressione Enter para continuar...")
                return
            
            id_venda = int(id_venda)
            
            # Verifica se o ID existe na lista de pendentes
            existe = False
            for v in vendas_pendentes:
                if v.get('id_venda') == id_venda:
                    existe = True
                    break
            
            if not existe:
                print(f" Venda {id_venda} não encontrada ou não está pendente.")
                input("\nPressione Enter para continuar...")
                return
            
            confirmar = input(f"Tem certeza que deseja cancelar a venda {id_venda}? (S/N): ").upper()
            
            if confirmar != 'S':
                print("Operação cancelada.")
                input("\nPressione Enter para continuar...")
                return
            
            # Cancela venda
            response = requests.post(
                f"http://localhost:5000/vendas/{id_venda}/cancelar",
                json={"motivo": "Cancelado pelo gerente"},
                headers={"Authorization": f"Bearer {TOKEN}"}
            )
            
            if response.status_code == 200:
                print(f"Venda {id_venda} cancelada com sucesso!")
            else:
                erro = response.json().get('erro', 'Erro desconhecido')
                print(f" Falha ao cancelar: {erro}")
                
        except ValueError:
            print(" ID inválido. Digite apenas números.")
            
    except Exception as e:
        print(f" Erro: {e}")
    
    input("\nPressione Enter para continuar...")

def gerar_relatorios():
    """Exibe o relatório completo do sistema"""
    print("\n" + "-"*60)
    print("       RELATÓRIO DO SISTEMA")
    print("-"*60)
    
    try:
        response = requests.get(
            "http://localhost:5000/api/relatorios/geral",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        
        if response.status_code == 200:
            dados = response.json()
            
            print("\n RESUMO GERAL")
            print("-" * 50)
            print(f"   Total de Clientes: {dados.get('total_clientes', 0)}")
            print(f"   Total de Produtos: {dados.get('total_produtos', 0)}")
            
            # Converter para float
            total_vendas = dados.get('total_vendas_concluidas', 0)
            print(f"   Vendas Concluídas: {total_vendas}")
            
            total_arrecadado = float(dados.get('total_arrecadado', 0))
            print(f"   Total Arrecadado: R$ {total_arrecadado:.2f}")
            
            # Vendas por status
            vendas_status = dados.get('vendas_por_status', [])
            if vendas_status:
                print("\n VENDAS POR STATUS")
                print("-" * 50)
                for item in vendas_status:
                    status = item.get('status', 'desconhecido')
                    total = item.get('total', 0)
                    valor = float(item.get('valor_total', 0))
                    if status == 'pago':
                        print(f"   Pagas: {total} vendas - R$ {valor:.2f}")
                    elif status == 'pendente':
                        print(f"   Pendentes: {total} vendas - R$ {valor:.2f}")
                    elif status == 'cancelado':
                        print(f"   Canceladas: {total} vendas - R$ {valor:.2f}")
            
            # Produtos mais vendidos
            produtos = dados.get('produtos_mais_vendidos', [])
            if produtos:
                print("\n PRODUTOS MAIS VENDIDOS")
                print("-" * 50)
                for i, p in enumerate(produtos, 1):
                    print(f"  {i}º - {p.get('nome', 'Desconhecido')} - {p.get('total_vendido', 0)} unidades")
            
            # Top clientes
            clientes = dados.get('clientes_top', [])
            if clientes:
                print("\n CLIENTES QUE MAIS COMPRARAM")
                print("-" * 50)
                for i, c in enumerate(clientes, 1):
                    total_gasto = float(c.get('total_gasto', 0))
                    print(f"  {i}º - {c.get('nome', 'Desconhecido')} - {c.get('compras', 0)} compras - R$ {total_gasto:.2f}")
            
            print("\n" + "-"*60)
            print(" Relatório gerado com sucesso!")
            
        elif response.status_code == 403:
            erro = response.json().get('erro', 'Acesso negado')
            print(f"\n {erro}")
        else:
            print(f"\n Erro: {response.json().get('erro', 'Erro desconhecido')}")
            
    except Exception as e:
        print(f"\n Erro ao gerar relatório: {e}")
    
    input("\nPressione Enter para continuar...")

if __name__ == "__main__":
    main_menu()