import { ReactNode } from 'react';
import Logo from './Logo';
import ToyBoxArt from './ToyBoxArt';

interface Props {
  kicker: string;
  title: string;
  ticket: string;
  children: ReactNode;
}

/** Tela cheia de login/cadastro: atmosfera à esquerda, "crachá" à direita. */
export default function AuthShell({ kicker, title, ticket, children }: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* lado da atmosfera */}
      <section
        className="relative overflow-hidden flex flex-col p-8 lg:px-12 lg:py-10 lg:h-screen lg:sticky lg:top-0"
        style={{
          background:
            'radial-gradient(700px 420px at 70% 85%, rgba(255,51,68,.28), transparent 65%), radial-gradient(600px 400px at 10% 0%, rgba(94,10,16,.9), transparent 70%), linear-gradient(160deg, #3a0508, #0e0a0a 75%)',
        }}
      >
        <Logo size={36} tagline href={null} />

        <div className="flex-1 flex flex-col justify-center gap-4 min-h-0 py-6">
          <div className="relative z-[1]">
            <p className="eyebrow mb-3">{kicker}</p>
            <h1 className="display text-[clamp(2.2rem,min(4.4vw,7.2vh),4.2rem)] text-[var(--paper)] text-shadow-ink">
              {title.split('|').map((parte, i) =>
                i === 1 ? (
                  <span key={i} className="flicker">
                    {parte}
                  </span>
                ) : (
                  <span key={i}>{parte}</span>
                ),
              )}
            </h1>
          </div>

          <ToyBoxArt className="hidden lg:block self-end h-[clamp(170px,40vh,430px)] w-auto max-w-full shrink-0 drop-shadow-[0_20px_30px_rgba(0,0,0,.45)]" />
        </div>

        <p className="relative z-[1] mono text-xs tracking-[0.2em] uppercase text-[var(--muted)]">
          Turno da noite · Setor de expedição
        </p>
      </section>

      {/* lado do crachá */}
      <section className="relative flex items-center justify-center p-6 lg:p-12 badge-bg">
        <div
          className="absolute inset-y-0 left-0 w-3 hidden lg:block"
          style={{ background: 'repeating-linear-gradient(-45deg, var(--hazard) 0 14px, #111 14px 28px)' }}
        />
        <div className="w-full max-w-[430px] rise">
          {/* presilha do crachá */}
          <div className="mx-auto w-20 h-7 border-[4px] border-b-0 border-[#b9b2a6] rounded-t-2xl" aria-hidden />
          <div className="mx-auto -mt-1 w-28 h-4 rounded-md bg-[#b9b2a6] border-[3px] border-[var(--ink)]" aria-hidden />
          <div className="paper overflow-hidden -mt-1" style={{ transform: 'rotate(-1deg)', boxShadow: '8px 8px 0 var(--ink), 0 30px 60px rgba(0,0,0,.55)' }}>
            <div className="bg-[var(--red)] border-b-[3px] border-[var(--ink)] px-5 py-3 flex items-center justify-between">
              <span className="mono text-[0.72rem] tracking-[0.2em] uppercase text-[var(--paper)]">{ticket}</span>
              <span className="flex gap-1.5" aria-hidden>
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--hazard)] border-2 border-[var(--ink)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--teal)] border-2 border-[var(--ink)]" />
              </span>
            </div>
            <div className="p-6 sm:p-7" style={{ transform: 'rotate(1deg)' }}>
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
