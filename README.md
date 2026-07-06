<div align="center">

# **Playtime**
### Sistema para Lojas de Brinquedos
---

## **Sobre o Projeto**

O **Playtime** é um sistema web completo para gerenciamento de lojas de brinquedos, desenvolvido como projeto da disciplina **Programação para Web**. O sistema permite que clientes comprem produtos, vendedores realizem vendas e gerentes controlem estoque, clientes e gerem relatórios.

---

## 👥 **Atores do Sistema**

| Ator | Funcionalidades |
|------|-----------------|
| **Cliente** | • Consultar produtos<br>• Realizar cadastro<br>• Comprar produtos<br>• Visualizar histórico de compras<br>• Finalizar compras pendentes<br>• Atualizar perfil |
| **Vendedor** | • Gerenciar cadastro de clientes<br>• Consultar produtos<br>• Realizar vendas<br>• Consultar vendas realizadas |
| **Gerente** | • Atualizar estoque<br>• Gerenciar produtos (CRUD)<br>• Gerenciar clientes (CRUD)<br>• Gerar relatórios<br>• Cancelar vendas pendentes |
| **Sistema de Pagamento** | • Processamento externo de transações financeiras (simulado) |

---

## 📋 **Casos de Uso**

| # | Caso de Uso | Atores | 
|---|-------------|--------|
| 1 | Consultar produto | Cliente, Vendedor, Gerente |
| 2 | Comprar produto | Cliente | 
| 3 | Fazer cadastro | Cliente | 
| 4 | Histórico de compras | Cliente | 
| 5 | Finalizar compra pendente | Cliente | 
| 6 | Atualizar perfil | Cliente | 
| 7 | Realizar venda | Vendedor, Gerente | 
| 8 | Gerenciar clientes | Gerente | 
| 9 | Consultar vendas | Vendedor, Gerente | 
| 10 | Gerenciar produtos | Gerente | 
| 11 | Atualizar estoque | Gerente | 
| 12 | Cancelar venda | Gerente | 
| 13 | Gerar relatórios | Gerente | 
| 14 | Vendas por período | Gerente | 
| 15 | Produtos mais vendidos | Gerente | 
| 16 | Processar pagamento | Sistema Pagamento | 

![Diagrama de Casos de Uso](./Casos_de_uso.png)

---

## 🗄️ **Diagrama de Classes (Back-end)**

![Diagrama de Classes](./Diagrama_de_classes.png)

### Entidades principais:

| Entidade | Descrição |
|----------|-----------|
| **Cliente** | Dados pessoais do cliente (nome, CPF, email, ativo) |
| **Usuario** | Autenticação e perfil (email, senha_hash, perfil, ativo, nome) |
| **Produto** | Produtos da loja (nome, descrição, preço, estoque, categoria) |
| **Venda** | Vendas realizadas (cliente, data, valor, status, método pagamento) |
| **ItemVenda** | Itens de cada venda (produto, quantidade, preço unitário, subtotal) |
| **Cancelamento** | Registro de vendas canceladas (motivo, data) |
| **Permissoes** | Controle de acesso RBAC (perfil, permissões em JSON) |

### Relacionamentos:

- **Clientes** (1) ― (N) **Vendas**: Um cliente pode ter várias vendas
- **Clientes** (1) ― (1) **Usuarios**: Cada cliente tem um usuário associado
- **Vendas** (1) ― (N) **ItensVenda**: Uma venda tem vários itens
- **Produtos** (1) ― (N) **ItensVenda**: Um produto pode estar em vários itens
- **Vendas** (1) ― (1) **Cancelamentos**: Uma venda pode ter um cancelamento

---

## 🛠️ **Tecnologias Utilizadas**

<div align="center">

| Categoria | Tecnologias |
|-----------|-------------|
| **Front-end** | Next.js · TypeScript · JavaScript · Tailwind CSS |
| **Back-end** | Python · Flask · JWT · bcrypt |
| **Banco de Dados** | PostgreSQL (Neon.tech) |
| **Versionamento** | Git · GitHub |
| **Prototipação** | Figma |
| **Arquitetura** | DDD · Repository Pattern · Arquitetura em Camadas |

</div>

---

## 🔐 **Autenticação e Segurança**

O sistema utiliza **JWT (JSON Web Token)** para autenticação e **RBAC (Role-Based Access Control)** para controle de permissões.

### Perfis e Permissões

| Perfil | Permissões |
|--------|------------|
| **Cliente** | • Consultar produtos<br>• Comprar produtos<br>• Ver próprias compras<br>• Atualizar perfil |
| **Vendedor** | • Consultar produtos<br>• Realizar vendas<br>• Consultar vendas<br>• Gerenciar clientes |
| **Gerente** | • Todas as permissões acima<br>• Gerenciar produtos (CRUD)<br>• Atualizar estoque<br>• Cancelar vendas<br>• Gerar relatórios |

---

## 📊 **Endpoints da API**

### Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/login` | Login e geração de token JWT | ❌ |
| POST | `/api/registrar` | Registrar novo usuário (cliente) | ❌ |
| GET | `/api/me/perfil` | Buscar perfil do usuário logado | ✅ |
| POST | `/api/verificar-email` | Verificar se email já está cadastrado | ❌ |

### Clientes

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/clientes` | Listar todos os clientes | ✅ (Vendedor/Gerente) |
| GET | `/clientes/{id}` | Buscar cliente por ID | ✅ |
| POST | `/clientes` | Cadastrar novo cliente | ❌ |
| PUT | `/clientes/{id}` | Atualizar cliente | ✅ (Vendedor/Gerente) |
| DELETE | `/clientes/{id}` | Deletar cliente | ✅ (Gerente) |

### Produtos

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/produtos` | Listar todos os produtos | ✅ |
| GET | `/produtos/{id}` | Buscar produto por ID | ✅ |
| POST | `/produtos` | Cadastrar novo produto | ✅ (Gerente) |
| PUT | `/produtos/{id}` | Atualizar produto | ✅ (Gerente) |
| PATCH | `/produtos/{id}/estoque` | Atualizar estoque | ✅ (Gerente) |
| DELETE | `/produtos/{id}` | Deletar produto | ✅ (Gerente) |

### Vendas e Compras

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/vendas` | Listar todas as vendas | ✅ (Vendedor/Gerente) |
| GET | `/vendas/{id}` | Buscar venda por ID | ✅ |
| GET | `/compras/cliente` | Listar compras do cliente logado | ✅ (Cliente) |
| POST | `/vendas/comprar` | Cliente comprar produto | ✅ (Cliente) |
| POST | `/vendas/direta` | Realizar venda (cria e finaliza) | ✅ (Vendedor/Gerente) |
| POST | `/vendas/{id}/finalizar` | Finalizar venda | ✅ |
| POST | `/vendas/{id}/cancelar` | Cancelar venda | ✅ (Gerente) |
| POST | `/vendas/pendente` | Criar venda pendente | ✅ |
| POST | `/vendas/{id}/itens` | Adicionar item à venda | ✅ |
| GET | `/vendas/{id}/itens` | Listar itens da venda | ✅ |
| DELETE | `/vendas/{id}/itens/{produto_id}` | Remover item da venda | ✅ |

### Relatórios

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/relatorios/geral` | Relatório geral do sistema | ✅ (Gerente) |
| GET | `/api/relatorios/vendas-periodo` | Vendas por período | ✅ (Gerente) |
| GET | `/api/relatorios/produtos-mais-vendidos` | Produtos mais vendidos | ✅ (Gerente) |

---

## 🎨 **Figma - Prototipação**

![Figma]()

---

## 🖥️ **Páginas Implementadas**

| Rota | Página | Descrição | Perfil |
|------|--------|-----------|--------|
| `/login` | Login | Acesso para usuários | Público |
| `/menu` | Menu Principal | Navegação entre funcionalidades | Todos |
| `/pesquisa` | Pesquisar Produtos | Busca e visualização de produtos | Todos |
| `/compra` | Finalizar Compra | Carrinho e simulação de compra | Cliente |
| `/estoque` | Gestão de Estoque | Gerente atualiza quantidades | Gerente |
| `/produto` | Gerenciar Produtos | CRUD completo de produtos | Gerente |
| `/venda` | Realizar Venda | Vendedor realiza venda para cliente | Vendedor/Gerente |

---

## 🗄️ **Banco de Dados**

### Modelo Relacional

- **clientes**: Armazena dados pessoais dos clientes (id_cliente, nome, cpf, email, ativo, data_cadastro)
- **usuarios**: Armazena credenciais e perfil dos usuários (id_usuario, id_cliente, email, senha_hash, perfil, ativo, nome, data_cadastro)
- **produtos**: Armazena o catálogo de produtos (id_produto, nome, descricao, preco_unitario, estoque, categoria, data_cadastro)
- **vendas**: Armazena as transações de venda (id_venda, id_cliente, data_venda, valor_total, status, metodo_pagamento, id_transacao_pagamento)
- **itens_venda**: Armazena os itens de cada venda (id_item, id_venda, id_produto, quantidade, preco_unitario, subtotal)
- **cancelamentos**: Registra vendas canceladas (id_cancelamento, id_venda, id_cliente, motivo, data_cancelamento)
- **permissoes**: Controla permissões por perfil (id_permissao, perfil, permissoes)

### Relacionamentos entre tabelas

- **clientes** (1) ― (N) **vendas**: Um cliente pode ter várias vendas
- **clientes** (1) ― (1) **usuarios**: Cada cliente tem um usuário associado
- **vendas** (1) ― (N) **itens_venda**: Uma venda tem vários itens
- **produtos** (1) ― (N) **itens_venda**: Um produto pode estar em vários itens
- **vendas** (1) ― (1) **cancelamentos**: Uma venda pode ter um cancelamento

---

## 🚀 **Como Executar o Projeto**

### Pré-requisitos

- Python 3.9+
- Node.js 18+

### Back-end

```bash
# 1. Clone o repositório
git clone https://github.com/ahclara/Playtime.git
cd Playtime/back-end

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Execute o servidor
python app.py
```

### Front-end

```bash

```

---

## 👥 **Equipe**

| Nome | Responsabilidade |
|------|------------------|
| Eduarda Cecília | Back-end · Banco de Dados | 
| Ana Clara | Front-end · Design | 
---
