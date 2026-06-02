from __future__ import annotations
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.SistemaVendas import SistemaVendas

sistema = SistemaVendas()

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def main_menu():
    while True:
        clear_screen()
        print("=" * 50)
        print("   SISTEMA PLAYTIME - LOJA DE BRINQUEDOS")
        print("=" * 50)
        print("1. Cliente")
        print("2. Vendedor")
        print("3. Gerente")
        print("0. Sair")
        print("-" * 50)
        
        opcao = input("Escolha uma opção: ")
        
        if opcao == '0':
            print("\nSistema encerrado!")
            break
        else:
            print(f"\nVocê escolheu a opção {opcao}")
            print("Funcionalidade em desenvolvimento...")
            time.sleep(2)

if __name__ == "__main__":
    main_menu()
