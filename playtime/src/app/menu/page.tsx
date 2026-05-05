import Link from "next/link";

export default function MenuPage() {
  const opcoes = [
    { nome: "🔍 Pesquisar Produtos", href: "/pesquisa", cor: "bg-blue-500", descricao: "Busque produtos disponíveis" },
    { nome: "🛒 Comprar", href: "/compra", cor: "bg-green-500", descricao: "Adicione ao carrinho e compre" },
    { nome: "📦 Estoque", href: "/estoque", cor: "bg-yellow-500", descricao: "Controle quantidades" },
    { nome: "🧸 Produtos", href: "/produto", cor: "bg-purple-500", descricao: "Gerencie o catálogo" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🧸 Playtime</h1>
          <div className="text-sm text-gray-500">Vendedor: Ana Souza</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu Principal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opcoes.map((op) => (
            <Link key={op.href} href={op.href}>
              <div className={`${op.cor} text-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer`}>
                <div className="text-4xl mb-2">{op.nome.split(" ")[0]}</div>
                <h3 className="text-xl font-bold">{op.nome.substring(2)}</h3>
                <p className="text-white/80 text-sm mt-1">{op.descricao}</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/login" className="text-red-500 text-sm">Sair</Link>
        </div>
      </div>
    </div>
  );
}