# Testes automatizados (Cypress) — Playtime

Os testes cobrem **todos os cenários do documento "Cenário de Testes – Playtime"**. Cada funcionalidade tem o **cenário CORRETO** (caminho feliz) e o **cenário INCORRETO** (caminho alternativo/inválido).

São duas suítes:

| Suíte | Pasta | O que testa | Precisa do back-end? |
|---|---|---|---|
| **Interface** | `cypress/e2e/frontend/` | Telas do Next.js (login, cadastro, vitrine, carrinho, gerência…). As respostas da API são simuladas com `cy.intercept`, no mesmo formato que a API Flask devolve. | Não, só o front |
| **API** | `cypress/e2e/api/` | Regras do back-end Flask de verdade: status HTTP, RBAC (401/403), estoque, vendas, relatórios… | Sim: back-end + PostgreSQL |

```
cypress/
├── e2e/
│   ├── frontend/                       ← testes de interface
│   │   ├── 01-autenticacao-cadastro.cy.ts
│   │   ├── 02-gerenciamento-clientes.cy.ts
│   │   ├── 03-gerenciamento-produtos.cy.ts
│   │   ├── 04-estoque.cy.ts
│   │   ├── 05-vendas-compras.cy.ts
│   │   └── 06-relatorios.cy.ts
│   └── api/                            ← testes de API (mesma numeração)
├── fixtures/                           ← produtos, clientes, vendas, relatório
└── support/
    ├── commands.ts                     ← cy.visitComo, cy.campo, cy.api, cy.novoCliente…
    ├── dados.ts                        ← usuários de teste, gerador de JWT, helpers
    └── e2e.ts
cypress.config.ts
cypress.env.example.json
back-end/scripts/seed_cypress.py        ← cria o gerente e o vendedor de teste
```

## Pré-requisitos

- **Node.js 22 ou mais novo** (o Cypress 16 não roda no Node 20). Se você usa Node 20, troque para `npm i -D cypress@15` e os testes continuam funcionando.
- Google Chrome (ou use o Electron que vem com o Cypress).

## Como rodar

### 1. Instalar
```bash
cd playtime
npm install            # instala o Cypress junto (devDependency)
```

### 2. Subir o front-end
```bash
npm run dev            # http://localhost:3000
```

### 3. (Só para a suíte de API) subir o back-end e criar os usuários de teste
```bash
cd back-end
pip install -r requirements.txt
# .env com DATABASE_URL e SECRET_KEY (veja .env.example)
python scripts/seed_cypress.py   # cria gerente.cypress@playtime.com / vendedor.cypress@playtime.com
python app.py                    # http://localhost:5000
```
> O seed também cria as tabelas (caso o banco esteja vazio) e a coluna `usuarios.nome`, que o `/api/registrar` usa, mas que o `init_db()` não cria.

Se quiser outros usuários/senhas, copie `cypress.env.example.json` para `cypress.env.json` e edite. A URL da API pode ser trocada com `--expose apiUrl=http://...`.

### 4. Executar
```bash
npm run cy:open        # abre a interface do Cypress
npm run cy:front       # só os testes de interface (headless)
npm run cy:api         # só os testes de API (headless)
npm run cy:run         # tudo
```

## Mapa cenário → teste

Todos os `it(...)` começam com **CORRETO:** ou **INCORRETO:** e repetem o nome do cenário do documento.

| # | Funcionalidade | Interface | API |
|---|---|---|---|
| 1 | Login do Usuário | ✔ (cliente, vendedor e gerente) | ✔ |
| 1 | Cadastro de Cliente | ✔ (um teste por campo vazio) | ✔ |
| 1 | Verificação de e-mail | ✔ | ✔ (`/api/verificar-email`) |
| 1 | Consulta de perfil | ✔ (token válido, sem token, expirado, 401) | ✔ (`/api/me/perfil`) |
| 2 | Cadastro de cliente pelo vendedor | ✔ | ✔ |
| 2 | Atualização de cliente | ✔ | ✔ |
| 2 | Exclusão de cliente | ✔ | ✔ |
| 3 | Consulta de produtos | ✔ | ✔ |
| 3 | Cadastro de produto | ✔ | ✔ |
| 3 | Atualização de produto | ✔ | ✔ |
| 3 | Exclusão de produto | ✔ | ✔ |
| 4 | Atualização de estoque | ✔ | ✔ |
| 5 | Cliente compra produto | ✔ | ✔ |
| 5 | Venda direta pelo vendedor | ✔ | ✔ (`/api/vendas/direta`) |
| 5 | Venda pendente | ✔ | ✔ |
| 5 | Finalizar compra pendente | ✔ | ✔ |
| 5 | Consultar vendas | ✔ | ✔ |
| 5 | Cancelar venda | ✔ | ✔ |
| 6 | Relatório geral | ✔ | ✔ |
| 6 | Vendas por período | — (não existe tela) | ✔ |
| 6 | Produtos mais vendidos | ✔ | ✔ |

## Testes que falham hoje (bugs encontrados)

Os testes seguem o que o **documento de cenários** pede. Quando o sistema não faz isso, o teste falha de propósito. Rodando a suíte de API contra o back-end atual: **32 passam e 13 falham**. Na interface, **1 falha**.

| Teste | O que o documento pede | O que o sistema faz hoje | Onde corrigir |
|---|---|---|---|
| API · Consulta de perfil (CORRETO) | devolver nome, e-mail **e perfil de acesso** | devolve só os dados do cliente, sem `perfil` | `routes/Auth_routes.py` → `meu_perfil` |
| API · Cliente tenta cadastrar outro cliente | 403 | 201: `POST /api/clientes` não tem `@token_required`/`@role_required` | `routes/Cliente_routes.py` → `criar_cliente` |
| API · Listagem de produtos (CORRETO) | nome, preço, estoque **e categoria** | `Produto.to_dict()` não devolve `categoria`/`descricao` | `models/Produto.py` e `routes/Produto_routes.py` |
| API · Cadastro de produto (CORRETO) | salvar descrição e categoria | o `INSERT` grava só nome, preço e estoque | `routes/Produto_routes.py` → `criar_produto` |
| API · Cadastro com preço negativo | impedir (400) | aceita (201) | `criar_produto` |
| API · Exclusão de produto vinculado a vendas | mensagem "possui vendas vinculadas" | erro 500 de chave estrangeira do PostgreSQL | `deletar_produto` |
| API + Interface · Estoque com valor negativo | rejeitar | aceita e o estoque fica negativo (o modal também não bloqueia) | `atualizar_estoque` e `admin/produtos/page.tsx` → `salvarEstoque` |
| API · Adição de item a venda inexistente | JSON `"Venda não encontrada"` | 404 em HTML: o blueprint `ItemVenda_routes` não está registrado no `app.py` | `app.py` |
| API · Finalizar pendente sem estoque | impedir e dizer qual produto | finaliza e deixa o estoque negativo | `routes/Venda_routes.py` → `finalizar_venda` |
| API · Vendas por período (2 testes) | rota funcionando, recusar data final < inicial | 404: `controllers/RelatorioController.py` não está registrado | `app.py` (e validar as datas) |
| API · Produtos mais vendidos (2 testes) | lista ordenada / lista vazia sem erro | 404: mesma causa | `app.py` |

Observações:
- A mensagem de login errado no back-end é "Email ou senha inválidos", e não "Credenciais inválidas". O teste aceita as duas.
- O cadastro mostra a mensagem genérica "Preencha todos os campos obrigatórios.", sem dizer qual campo falta. A API já diz qual é (`Campo cpf é obrigatório`).
- A tela de finalização usa o `id_cliente` do usuário logado, então o vendedor não escolhe para qual cliente vende. O teste de interface da venda direta usa um vendedor com cliente vinculado. A venda direta "de verdade" (`/api/vendas/direta`) é testada na suíte de API.
