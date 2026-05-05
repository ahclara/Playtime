
<div align="center">

#  **Playtime**
### Sistema para Lojas de Brinquedos

---

##  **Sobre o Projeto**

O **Playtime** é um sistema web desenvolvido para gerenciar lojas de brinquedos, permitindo que clientes comprem produtos, vendedores realizem vendas e gerentes controlem estoque e relatórios.

---

##  **Atores do Sistema**

|    Ator |  Funcionalidades |
|---------|---------------------|
|  **Cliente** | Consultar produtos · Realizar cadastro · Comprar produtos |
|  **Vendedor** | Gerenciar cadastro · Consultar produtos · Realizar vendas · Consultar vendas |
|  **Gerente** | Atualizar estoque · Gerenciar produtos · Gerar relatórios · Consultar vendas |
|  **Sistema de Pagamento** | Processamento externo de transações financeiras |

---

##  **Casos de Uso (versão inicial)**

(colocar iamgem aqui)


| # | Caso de Uso | Atores |
|---|-------------|--------|
| 1 | Consultar produto | Cliente, Vendedor |
| 2 | Comprar produto | Cliente |
| 3 | Realizar venda | Vendedor |
| 4 | Atualizar estoque | Gerente |
| 5 | Gerenciar produto | Gerente |
| 6 | Fazer cadastro | Cliente |

---

##  **Tecnologias Utilizadas**

<div align="center">

| Categoria | Tecnologias |
|-----------|-------------|
| **Front-end** | Next.js 15 · TypeScript · Tailwind CSS |
| **Versionamento** | Git · GitHub |
| **Prototipação** | Figma |

</div>

---

## **Páginas Implementadas**

|  Rota |  Página |  Descrição |
|---------|-----------|--------------|
| `/login` | Login | Acesso para usuários |
| `/menu` | Menu Principal | Navegação entre todas as funcionalidades |
| `/pesquisa` | Pesquisar Produtos | Busca e visualização de produtos |
| `/compra` | Finalizar Compra | Carrinho e simulação de compra |
| `/estoque` | Gestão de Estoque | Gerente atualiza quantidades dos produtos |
| `/produto` | Gerenciar Produtos | CRUD básico de produtos |

---

## **Credenciais**

Vendedor: vendedor@playtime.com / 123456

Gerente: gerente@playtime.com / 123456

Cliente: cliente@email.com / 123456 (ou cadastre um novo)

---

## **Como Executar o Projeto**

 Passo a passo

```bash
# 1. Clone o repositório -
git clone https://github.com/seu-usuario/playtime.git

# 2. Acesse a pasta do projeto -
cd playtime

# 3. Instale as dependências -
npm install

# 4. Execute o servidor de desenvolvimento -
npm run dev
