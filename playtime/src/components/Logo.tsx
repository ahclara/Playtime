import Link from 'next/link';

const LETRAS = [
  { c: 'P', r: -6, cor: 'var(--red)' },
  { c: 'L', r: 4, cor: 'var(--paper)' },
  { c: 'A', r: -3, cor: 'var(--paper)' },
  { c: 'Y', r: 6, cor: 'var(--red)' },
  { c: 'T', r: -4, cor: 'var(--paper)' },
  { c: 'I', r: 3, cor: 'var(--paper)' },
  { c: 'M', r: -5, cor: 'var(--paper)' },
  { c: 'E', r: 5, cor: 'var(--red)' },
];

interface Props {
  size?: number;
  href?: string | null;
  tagline?: boolean;
}

/** Marca "PLAYTIME" em letras de brinquedo tortinhas. */
export default function Logo({ size = 30, href = '/produtos', tagline = false }: Props) {
  const marca = (
    <span className="inline-flex flex-col leading-none select-none" aria-label="Playtime">
      <span className="inline-flex items-end" aria-hidden>
        {LETRAS.map((l, i) => (
          <span
            key={i}
            className="display inline-block"
            style={{
              fontSize: size,
              color: l.cor,
              transform: `rotate(${l.r}deg)`,
              WebkitTextStroke: `${Math.max(1.5, size / 16)}px var(--ink)`,
              paintOrder: 'stroke fill',
              textShadow: `${size / 12}px ${size / 12}px 0 var(--ink)`,
              marginRight: size * 0.01,
            }}
          >
            {l.c}
          </span>
        ))}
      </span>
      {tagline && (
        <span className="mono uppercase" style={{ fontSize: Math.max(10, size * 0.3), letterSpacing: '0.32em', color: 'var(--hazard)', marginTop: size * 0.2 }}>
          Fábrica de Brinquedos
        </span>
      )}
    </span>
  );

  if (!href) return marca;
  return (
    <Link href={href} className="inline-flex hover:-rotate-1 transition-transform" aria-label="Playtime — início">
      {marca}
    </Link>
  );
}
