import Link from 'next/link';
import { FaPix } from 'react-icons/fa6';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-16 relative">
      <div className="hazard" />
      <div className="bg-[var(--ink)] border-t-[3px] border-[var(--ink)]">
        <div className="max-w-[1240px] mx-auto px-5 pt-12 pb-8 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size={34} tagline href={null} />
            <p className="mt-5 text-sm text-[var(--muted)] max-w-xs leading-relaxed">
              Brinquedos fofinhos, prateleiras escuras e uma linha de montagem que nunca dorme.
            </p>
          </div>

          <div>
            <h4 className="eyebrow mb-3">Loja</h4>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-[var(--hazard)]" href="/produtos">Todos os brinquedos</Link></li>
              <li><Link className="hover:text-[var(--hazard)]" href="/carrinho">Carrinho</Link></li>
              <li><Link className="hover:text-[var(--hazard)]" href="/compras">Minhas compras</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-3">Pagamento</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><FaPix className="text-[var(--teal)]" /> PIX</li>
              <li className="flex items-center gap-2"><FaCreditCard className="text-[var(--hazard)]" /> Crédito e débito</li>
              <li className="flex items-center gap-2"><FaMoneyBillWave className="text-[#3fbf5f]" /> Dinheiro</li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-3">Projeto</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Sistema para lojas de brinquedos — disciplina Programação para Web.
            </p>
          </div>
        </div>

        <div className="overflow-hidden select-none" aria-hidden>
          <p className="display outline-text text-center whitespace-nowrap opacity-20 text-[clamp(4rem,16vw,13rem)] leading-[0.8] -mb-4">
            PLAYTIME
          </p>
        </div>

        <div className="border-t border-[var(--line)]">
          <p className="max-w-[1240px] mx-auto px-5 py-4 mono text-[0.7rem] tracking-[0.15em] uppercase text-[var(--muted)] flex flex-wrap justify-between gap-2">
            <span>© {new Date().getFullYear()} Playtime</span>
            <span>Feito com cola, parafusos e um pouco de medo</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
