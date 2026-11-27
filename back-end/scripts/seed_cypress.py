"""
Prepara o banco para os testes automatizados (Cypress).

- Cria as tabelas (init_db) caso ainda não existam;
- Garante a coluna usuarios.nome (usada pelo /api/registrar);
- Cria/atualiza os usuários de teste Gerente e Vendedor com senha conhecida;
- Cria um cliente "fixo" para ser usado nas vendas do vendedor.

Uso (dentro da pasta back-end):
    python scripts/seed_cypress.py

As credenciais criadas aqui são as mesmas de playtime/cypress.env.example.json.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt  # noqa: E402
from database.Conexao import get_connection, init_db  # noqa: E402

USUARIOS = [
    {"email": os.getenv("CY_GERENTE_EMAIL", "gerente.cypress@playtime.com"),
     "senha": os.getenv("CY_GERENTE_SENHA", "gerente123"),
     "perfil": "gerente", "nome": "Gerente Cypress"},
    {"email": os.getenv("CY_VENDEDOR_EMAIL", "vendedor.cypress@playtime.com"),
     "senha": os.getenv("CY_VENDEDOR_SENHA", "vendedor123"),
     "perfil": "vendedor", "nome": "Vendedor Cypress"},
]


def main():
    init_db()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nome VARCHAR(100)")

    for u in USUARIOS:
        senha_hash = bcrypt.hashpw(u["senha"].encode(), bcrypt.gensalt()).decode()
        cur.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (u["email"],))
        if cur.fetchone():
            cur.execute(
                "UPDATE usuarios SET senha_hash = %s, perfil = %s, ativo = true, nome = %s WHERE email = %s",
                (senha_hash, u["perfil"], u["nome"], u["email"]),
            )
        else:
            cur.execute(
                "INSERT INTO usuarios (id_cliente, email, senha_hash, perfil, ativo, nome) "
                "VALUES (NULL, %s, %s, %s, true, %s)",
                (u["email"], senha_hash, u["perfil"], u["nome"]),
            )
        print(f"[ok] {u['perfil']}: {u['email']}")

    conn.commit()
    cur.close()
    conn.close()
    print("Banco pronto para os testes do Cypress.")


if __name__ == "__main__":
    main()
