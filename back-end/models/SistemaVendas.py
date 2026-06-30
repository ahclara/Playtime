from __future__ import annotations
from models.Cliente import Cliente
from models.Usuario import Usuario
from models.Produto import Produto
from models.Venda import Venda
from models.ItemVenda import ItemVenda
from models.ServicoPagamento import ServicoPagamento
from database.Conexao import get_connection
from psycopg2.extras import RealDictCursor
import bcrypt

class SistemaVendas:
    def __init__(self):
        self.clientes = {}
        self.usuarios = {}
        self.produtos = {}
        self.vendas = {}
        self.servico_pagamento = ServicoPagamento()
        self._carregar_dados()
    
    def _carregar_dados(self):
        """Carrega os dados do banco de dados na memória"""
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Carrega clientes
        cur.execute("SELECT * FROM clientes WHERE ativo = true")
        for row in cur.fetchall():
            cliente = Cliente(
                id_cliente=row['id_cliente'],
                nome=row['nome'],
                cpf=row['cpf'],
                email=row['email'],
                ativo=row.get('ativo', True)
            )
            self.clientes[cliente.id_cliente] = cliente

        # Carregar usuarios
        cur.execute("SELECT * FROM usuarios WHERE ativo = true")
        for row in cur.fetchall():
            
            # Cria usuario
            usuario = Usuario(
                id_cliente=row['id_cliente'],
                email=row['email'],
                senha_hash=row['senha_hash'],
                perfil=row['perfil'],
                id_usuario=row['id_usuario'],
                ativo=row.get('ativo', True),
                nome=row.get('nome')  
            )
        
            # Usa id_usuario como chave (porque id_cliente pode ser NULL)
            self.usuarios[usuario.id_usuario] = usuario

        # Carrega produtos
        cur.execute("SELECT * FROM produtos")
        for row in cur.fetchall():
            produto = Produto(
                id_produto=row['id_produto'],
                nome=row['nome'],
                preco_unitario=row['preco_unitario'],
                estoque=row['estoque']
            )
            self.produtos[produto.id_produto] = produto

        # Carrega vendas
        cur.execute("SELECT * FROM vendas")
        for row in cur.fetchall():
            venda = Venda(
                id_venda=row['id_venda'],
                id_cliente=row['id_cliente'],
                data_venda=row['data_venda'],
                status=row['status']
            )
            venda.valor_total = row['valor_total']
            venda.id_transacao_pagamento = row.get('id_transacao_pagamento')
    
            # Carrega itens da venda
            cur.execute("""
                SELECT iv.*, p.nome as nome_produto 
                FROM itens_venda iv
                JOIN produtos p ON iv.id_produto = p.id_produto
                WHERE iv.id_venda = %s
            """, (venda.id_venda,))
            for item_row in cur.fetchall():
                produto = self.produtos.get(item_row['id_produto'])
                if produto:
                    item = ItemVenda(
                        produto=produto,
                        quantidade=item_row['quantidade'],
                        id_item=item_row['id_item'],
                        preco_unitario=item_row['preco_unitario']
                    )
                    venda.itens.append(item)
    
            self.vendas[venda.id_venda] = venda

        cur.close()
        conn.close()
        print(f"Dados carregados: {len(self.clientes)} clientes, {len(self.usuarios)} usuarios, {len(self.produtos)} produtos, {len(self.vendas)} vendas")

    # --------- METODOS DE AUTENTICACAO ---------
    
    def autenticar(self, email, senha):
        """Autentica um usuário pelo email e senha"""
        for usuario in self.usuarios.values():
            if usuario.email == email and usuario.ativo:
                if bcrypt.checkpw(senha.encode('utf-8'), usuario.senha_hash.encode('utf-8')):
                    return usuario
        return None
    
    def buscar_usuario_por_email(self, email):
        """Busca um usuário pelo email"""
        print(f"Buscando usuário: {email}")
        print(f"Usuários em memória: {len(self.usuarios)}")
        for usuario in self.usuarios.values():
            print(f"  - {usuario.email} (Perfil: {usuario.perfil})")
            if usuario.email == email:
                print(f"Usuário encontrado: {usuario.email}")
                return usuario
        print(f"Usuário não encontrado: {email}")
        return None
    
    def buscar_usuario_por_cliente(self, id_cliente):
        """Busca um usuário pelo ID do cliente"""
        return self.usuarios.get(id_cliente)
    
    # --------- METODOS DE CLIENTE ---------
    
    def cadastrar_cliente(self, nome, cpf, email):
        """Cadastra um novo cliente"""
        # Verifica se já existe
        for c in self.clientes.values():
            if c.cpf == cpf:
                print("CPF já cadastrado!")
                return None
            if c.email == email:
              print("Email já cadastrado!")
              return None
    
        cliente = Cliente(nome, cpf, email)
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
         INSERT INTO clientes (nome, cpf, email)
            VALUES (%s, %s, %s)
            RETURNING id_cliente
        """, (cliente.nome, cliente.cpf, cliente.email))
        cliente.id_cliente = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        self.clientes[cliente.id_cliente] = cliente
        return cliente
    
    def cadastrar_usuario(self, nome, cpf, email, senha, perfil='cliente'):
        """
        Cadastra um novo usuário no sistema.
    
        IMPORTANTE:
        - Se perfil for 'cliente': cria registro em clientes e usuarios
        - Se perfil for 'vendedor' ou 'gerente': cria apenas em usuarios, porque o 'id_cliente' seria NULL 
        """
        conn = get_connection()
        cur = conn.cursor()
    
        try:
            # 1. Verifica se email ou CPF já existe
            cur.execute("SELECT id_cliente FROM clientes WHERE cpf = %s OR email = %s", (cpf, email))
            if cur.fetchone():
                cur.close()
                conn.close()
                print("CPF ou Email já cadastrado!")
                return None
        
            # 2. Verifica se email já existe na tabela usuarios
            cur.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (email,))
            if cur.fetchone():
                cur.close()
                conn.close()
                print("Email já cadastrado como usuário!")
                return None
        
            # 3. Hash da senha
            senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
            id_cliente = None
        
            # 4. Só cria na tabela clientes se for perfil 'cliente'
            if perfil == 'cliente':
                cur.execute("""
                    INSERT INTO clientes (nome, cpf, email)
                    VALUES (%s, %s, %s)
                    RETURNING id_cliente
                """, (nome, cpf, email))
                id_cliente = cur.fetchone()[0]
                print(f"Cliente '{nome}' criado com ID: {id_cliente}")
            else:
                print(f"Usuário '{nome}' criado como {perfil.upper()}")
        
            # 5. Cria usuário na tabela usuarios
            cur.execute("""
                INSERT INTO usuarios (id_cliente, email, senha_hash, perfil)
                VALUES (%s, %s, %s, %s)
                RETURNING id_usuario
            """, (id_cliente, email, senha_hash, perfil))
            id_usuario = cur.fetchone()[0]
        
            conn.commit()
        
            # 6. Cria objetos na memória
            usuario = Usuario(id_cliente, email, senha_hash, perfil, id_usuario)
            self.usuarios[id_usuario] = usuario
        
            if perfil == 'cliente' and id_cliente:
                cliente = Cliente(nome, cpf, email, id_cliente)
                self.clientes[id_cliente] = cliente
        
            print(f"Usuário '{email}' criado com perfil: {perfil}")
            return usuario
        
        except Exception as e:
            conn.rollback()
            print(f"Erro ao cadastrar usuário: {e}")
            return None
        finally:
            cur.close()
            conn.close()
    
    def buscar_cliente(self, id_cliente):
        return self.clientes.get(id_cliente)
    
    def listar_clientes(self):
        return list(self.clientes.values())
    
    def deletar_cliente(self, id_cliente):
        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute("UPDATE clientes SET ativo = false WHERE id_cliente = %s", (id_cliente,))
            cur.execute("UPDATE usuarios SET ativo = false WHERE id_cliente = %s", (id_cliente,))
            conn.commit()
            if id_cliente in self.clientes:
                self.clientes[id_cliente].ativo = False
            if id_cliente in self.usuarios:
                self.usuarios[id_cliente].ativo = False
            return True
        except:
            conn.rollback()
            return False
        finally:
            cur.close()
            conn.close()

    
    # -------- METODOS DE PRODUTO --------
    
    def cadastrar_produto(self, nome, preco_unitario, estoque=0):
        produto = Produto(nome, preco_unitario, estoque)
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO produtos (nome, preco_unitario, estoque)
            VALUES (%s, %s, %s)
            RETURNING id_produto
        """, (produto.nome, produto.preco_unitario, produto.estoque))
        produto.id_produto = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        self.produtos[produto.id_produto] = produto
        return produto
    
    def buscar_produto(self, id_produto):
        return self.produtos.get(id_produto)
    
    def listar_produtos(self):
        return list(self.produtos.values())
    
    def atualizar_estoque(self, id_produto, quantidade):
        produto = self.produtos.get(id_produto)
        if not produto:
            return False
        
        produto.atualizar_estoque(quantidade)
        
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE produtos SET estoque = %s WHERE id_produto = %s", 
                   (produto.estoque, id_produto))
        conn.commit()
        cur.close()
        conn.close()
        return True
    
    def deletar_produto(self, id_produto):
        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM itens_venda WHERE id_produto = %s", (id_produto,))
            cur.execute("DELETE FROM produtos WHERE id_produto = %s", (id_produto,))
            conn.commit()
            if id_produto in self.produtos:
                del self.produtos[id_produto]
            return True
        except:
            conn.rollback()
            return False
        finally:
            cur.close()
            conn.close()
    
    def atualizar_detalhes_produto(self, id_produto, nome=None, preco=None):
        produto = self.produtos.get(id_produto)
        if not produto:
            return False
        
        if nome:
            produto.nome = nome
        if preco:
            produto.preco_unitario = preco
        
        conn = get_connection()
        cur = conn.cursor()
        updates = []
        params = []
        if nome:
            updates.append("nome = %s")
            params.append(nome)
        if preco:
            updates.append("preco_unitario = %s")
            params.append(preco)
        
        if not updates:
            return False
        
        params.append(id_produto)
        query = f"UPDATE produtos SET {', '.join(updates)} WHERE id_produto = %s"
        cur.execute(query, params)
        conn.commit()
        cur.close()
        conn.close()
        return True
    
    # -------- METODOS DE VENDA --------
    
    def iniciar_nova_venda(self, id_cliente):
        """Inicia uma nova venda"""
        cliente = self.clientes.get(id_cliente)
        if not cliente or not cliente.ativo:
            return None
    
     # Cria venda com ID temporário
        venda = Venda(id_cliente=id_cliente, status='pendente')
        venda.id_venda = -1 
        self.vendas[venda.id_venda] = venda
        return venda
    
    def adicionar_item_venda(self, id_venda, id_produto, quantidade):
        venda = self.vendas.get(id_venda)
        if not venda or venda.status != 'pendente':
            return False
    
        produto = self.produtos.get(id_produto)
        if not produto or produto.estoque < quantidade:
            return False
    
     # Cria o item com o preço atual do produto
        item = ItemVenda(produto=produto, quantidade=quantidade)
        venda.itens.append(item)
        venda.valor_total = venda.calcular_total()
        return True
    
    def finalizar_venda(self, id_venda, dados_cartao=None):
        """Finaliza uma venda"""
        venda = self.vendas.get(id_venda)
        if not venda or venda.status != 'pendente':
            return False
    
        # Pagamento aprovado
        import uuid
        venda.id_transacao_pagamento = f"TXN_{uuid.uuid4().hex[:8].upper()}"
        venda.finalizar()
    
        conn = get_connection()
        cur = conn.cursor()
    
        try:
            # Inserir venda no banco
            cur.execute("""
                INSERT INTO vendas (id_cliente, valor_total, status, id_transacao_pagamento)
                VALUES (%s, %s, %s, %s)
                RETURNING id_venda
            """, (venda.id_cliente, venda.valor_total, venda.status, venda.id_transacao_pagamento))
            id_venda_real = cur.fetchone()[0]
            print(f"📝 Venda salva com ID real: {id_venda_real}")
        
            # Inserir itens
            for item in venda.itens:
                cur.execute("""
                    INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
                    VALUES (%s, %s, %s, %s, %s)
                """, (id_venda_real, item.produto.id_produto, item.quantidade, 
                    item.preco_unitario, item.subtotal))
            
                # Atualizar estoque no banco
                item.produto.estoque -= item.quantidade
                cur.execute("UPDATE produtos SET estoque = %s WHERE id_produto = %s", 
                       (item.produto.estoque, item.produto.id_produto))
            
                # Atualizar na memória
                print(f"Estoque atualizado: {item.produto.nome} = {item.produto.estoque}")
        
            conn.commit()
        
            # Remover venda antiga da memória (ID temporário)
            if id_venda in self.vendas:
                del self.vendas[id_venda]
        
            # Atualizar venda com ID real
            venda.id_venda = id_venda_real
            self.vendas[id_venda_real] = venda
        
            print(f"Venda {id_venda_real} finalizada com sucesso!")
            return True
        
        except Exception as e:
            conn.rollback()
            print(f"Erro ao finalizar venda: {e}")
            return False
        finally:
            cur.close()
            conn.close()
    
    def cancelar_venda(self, id_venda):
        venda = self.vendas.get(id_venda)
        if not venda or venda.status != 'pendente':
            return False
        
        venda.cancelar()
        
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE vendas SET status = 'cancelado' WHERE id_venda = %s", (id_venda,))
        conn.commit()
        cur.close()
        conn.close()
        return True
    
    def buscar_venda(self, id_venda):
        """Busca uma venda na memória ou no banco"""
        # Primeiro tenta na memória
        if id_venda in self.vendas:
            return self.vendas[id_venda]
    
        # Se não encontrar, busca no banco
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
    
        try:
            cur.execute("""
                SELECT v.*, c.nome as nome_cliente
                FROM vendas v
                JOIN clientes c ON v.id_cliente = c.id_cliente
                WHERE v.id_venda = %s
            """, (id_venda,))
            row = cur.fetchone()
        
            if not row:
             return None
        
         # Cria objeto Venda a partir dos dados do banco
            venda = Venda(
                id_venda=row['id_venda'],
                id_cliente=row['id_cliente'],
                data_venda=row['data_venda'],
                status=row['status']
            )
            venda.valor_total = row['valor_total']
            venda.id_transacao_pagamento = row.get('id_transacao_pagamento')
        
            # Carrega itens
            cur.execute("""
                SELECT iv.*, p.nome as nome_produto
                FROM itens_venda iv
                JOIN produtos p ON iv.id_produto = p.id_produto
                WHERE iv.id_venda = %s
             """, (id_venda,))
            for item_row in cur.fetchall():
             produto = self.produtos.get(item_row['id_produto'])
             if produto:
                item = ItemVenda(
                     produto=produto,
                     quituantidade=item_row['quantidade'],
                     id_item=item_row['id_item'],
                     preco_unitario=item_row['preco_unitario']
                )
                venda.itens.append(item)
        
            # Adiciona na memória para próximas consultas
            self.vendas[id_venda] = venda
            return venda
        
        except Exception as e:
           print(f"Erro ao buscar venda: {e}")
           return None
        finally:
            cur.close()
            conn.close()
    
    def get_total_clientes(self):
        return sum(1 for c in self.clientes.values() if c.ativo)
    
    def get_total_vendas_finalizadas(self):
        return sum(1 for v in self.vendas.values() if v.status == 'pago')
    
    def get_total_arrecadado(self):
        return sum(v.valor_total for v in self.vendas.values() if v.status == 'pago')