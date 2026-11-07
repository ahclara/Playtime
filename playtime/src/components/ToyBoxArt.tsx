import { useId } from 'react';

/**
 * Ilustração original: caixa de brinquedos entreaberta, com olhos
 * brilhando lá dentro e blocos de letras flutuando em volta.
 */

const INK = '#0e0a0a';

interface CubeProps {
  x: number;
  y: number;
  s: number;
  letra: string;
  cores: [string, string, string]; // frente, topo, lateral
  r?: number;
  delay?: string;
}

function Cube({ x, y, s, letra, cores, r = 0, delay = '0s' }: CubeProps) {
  const d = s * 0.3;
  const [frente, topo, lado] = cores;
  return (
    <g
      className="floaty"
      style={{ ['--r' as string]: `${r}deg`, animationDelay: delay, transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      <polygon points={`${x},${y} ${x + s},${y} ${x + s + d},${y - d} ${x + d},${y - d}`} fill={topo} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <polygon points={`${x + s},${y} ${x + s + d},${y - d} ${x + s + d},${y + s - d} ${x + s},${y + s}`} fill={lado} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x={x} y={y} width={s} height={s} rx="3" fill={frente} stroke={INK} strokeWidth="4" />
      <rect x={x + 5} y={y + 5} width={s - 10} height={s - 10} rx="3" fill="none" stroke={INK} strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1={x + 4} y1={y + 4} x2={x + s * 0.45} y2={y + 4} stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
      <text
        x={x + s / 2}
        y={y + s * 0.74}
        textAnchor="middle"
        fontFamily="'Luckiest Guy', system-ui, sans-serif"
        fontSize={s * 0.62}
        fill={INK}
      >
        {letra}
      </text>
    </g>
  );
}

function Sparkle({ x, y, s, cor, delay }: { x: number; y: number; s: number; cor: string; delay: string }) {
  return (
    <path
      className="twinkle"
      style={{ animationDelay: delay, transformBox: 'fill-box', transformOrigin: 'center' }}
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`}
      fill={cor}
    />
  );
}

export default function ToyBoxArt({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${uid}-${n}`;
  const url = (n: string) => `url(#${id(n)})`;

  return (
    <svg viewBox="0 0 500 460" className={className} role="img" aria-label="Caixa de brinquedos com olhos brilhando no escuro">
      <defs>
        <linearGradient id={id('front')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff4152" />
          <stop offset=".55" stopColor="#d01b2b" />
          <stop offset="1" stopColor="#9d0f1c" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d0c16" />
          <stop offset="1" stopColor="#4a060c" />
        </linearGradient>
        <linearGradient id={id('lidIn')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffc917" stopOpacity=".55" />
          <stop offset=".35" stopColor="#8a1420" />
          <stop offset="1" stopColor="#5e0a10" />
        </linearGradient>
        <linearGradient id={id('lidEdge')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff5a68" />
          <stop offset="1" stopColor="#d01b2b" />
        </linearGradient>
        <radialGradient id={id('hole')} cx=".5" cy=".7" r=".7">
          <stop offset="0" stopColor="#2a0a06" />
          <stop offset="1" stopColor="#030101" />
        </radialGradient>
        <radialGradient id={id('glow')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff3a8" />
          <stop offset=".4" stopColor="#ffc917" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffc917" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('beam')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffc917" stopOpacity=".35" />
          <stop offset="1" stopColor="#ffc917" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('plate')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#e8d6b0" />
        </linearGradient>
        <linearGradient id={id('metal')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2efe9" />
          <stop offset=".5" stopColor="#a9a39b" />
          <stop offset="1" stopColor="#6d6760" />
        </linearGradient>
        <pattern id={id('stripes')} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="12" height="24" fill="#ffc917" />
          <rect x="12" width="12" height="24" fill="#16100f" />
        </pattern>
        <pattern id={id('dots')} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="1.8" fill="#000" fillOpacity=".18" />
        </pattern>
        <clipPath id={id('frontClip')}>
          <rect x="110" y="232" width="250" height="176" rx="10" />
        </clipPath>
        <filter id={id('blur')} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={id('soft')} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* sombra no chão */}
      <ellipse cx="258" cy="420" rx="190" ry="20" fill="#000" opacity=".6" filter={url('soft')} />

      {/* feixe de luz saindo da caixa */}
      <polygon points="150,232 400,200 470,20 60,40" fill={url('beam')} opacity=".7" />

      {/* tampa aberta (face interna) */}
      <g className="lid-wobble" style={{ transformBox: 'view-box', transformOrigin: '270px 200px' }}>
        <polygon points="150,200 400,200 422,86 172,86" fill={url('lidIn')} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <polygon points="172,86 422,86 430,72 180,72" fill={url('lidEdge')} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <polygon points="400,200 422,86 430,72 408,190" fill="#7d0c16" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <polygon points="150,200 400,200 422,86 172,86" fill={url('dots')} />
        {/* dobradiças */}
        {[200, 340].map((hx) => (
          <rect key={hx} x={hx} y="192" width="34" height="14" rx="3" fill={url('metal')} stroke={INK} strokeWidth="3" />
        ))}
      </g>

      {/* interior escuro */}
      <polygon points="110,232 360,232 400,200 150,200" fill={url('hole')} stroke={INK} strokeWidth="5" strokeLinejoin="round" />

      {/* olhos */}
      <g>
        <ellipse cx="226" cy="216" rx="30" ry="16" fill={url('glow')} filter={url('blur')} />
        <ellipse cx="292" cy="216" rx="30" ry="16" fill={url('glow')} filter={url('blur')} />
        <g className="blink">
          <path d="M213 216 Q226 205 239 216 Q226 224 213 216Z" fill="#ffe66b" stroke="#8a5d00" strokeWidth="1" />
          <path d="M279 216 Q292 205 305 216 Q292 224 279 216Z" fill="#ffe66b" stroke="#8a5d00" strokeWidth="1" />
          <ellipse cx="228" cy="215.5" rx="2.2" ry="4.5" fill={INK} />
          <ellipse cx="294" cy="215.5" rx="2.2" ry="4.5" fill={INK} />
        </g>
      </g>

      {/* lateral */}
      <polygon points="360,232 400,200 400,376 360,408" fill={url('side')} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <polygon points="360,370 400,340 400,364 360,396" fill={url('stripes')} opacity=".85" />
      <line x1="372" y1="236" x2="372" y2="392" stroke="#fff" strokeOpacity=".12" strokeWidth="4" />

      {/* frente */}
      <rect x="110" y="232" width="250" height="176" rx="10" fill={url('front')} />
      <g clipPath={url('frontClip')}>
        <rect x="110" y="232" width="250" height="176" fill={url('dots')} />
        <rect x="110" y="372" width="250" height="36" fill={url('stripes')} />
        <rect x="110" y="372" width="250" height="36" fill="#000" opacity=".12" />
        {/* brilho superior */}
        <rect x="110" y="232" width="250" height="10" fill="#fff" opacity=".18" />
      </g>
      <line x1="110" y1="372" x2="360" y2="372" stroke={INK} strokeWidth="4" />
      <rect x="110" y="232" width="250" height="176" rx="10" fill="none" stroke={INK} strokeWidth="5" />
      <rect x="120" y="242" width="230" height="122" rx="6" fill="none" stroke={INK} strokeOpacity=".35" strokeWidth="2" />

      {/* cantoneiras de metal */}
      {[
        { x: 110, y: 232, sx: 1, sy: 1 },
        { x: 360, y: 232, sx: -1, sy: 1 },
        { x: 110, y: 408, sx: 1, sy: -1 },
        { x: 360, y: 408, sx: -1, sy: -1 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.sx} ${c.sy})`}>
          <path d="M0 10 Q0 0 10 0 H34 V10 H10 V34 H0Z" fill={url('metal')} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="20" cy="5" r="2" fill={INK} />
          <circle cx="5" cy="20" r="2" fill={INK} />
        </g>
      ))}

      {/* placa */}
      <g transform="rotate(-3 235 300)">
        <rect x="150" y="270" width="170" height="58" rx="8" fill="#000" opacity=".35" transform="translate(4 5)" />
        <rect x="150" y="270" width="170" height="58" rx="8" fill={url('plate')} stroke={INK} strokeWidth="4" />
        <rect x="157" y="277" width="156" height="44" rx="5" fill="none" stroke={INK} strokeOpacity=".25" strokeWidth="1.5" />
        <text
          x="235"
          y="309"
          textAnchor="middle"
          fontFamily="'Luckiest Guy', system-ui, sans-serif"
          fontSize="25"
          textLength="136"
          lengthAdjust="spacingAndGlyphs"
          fill={INK}
        >
          BRINQUEDOS
        </text>
        {[160, 310].map((px) => (
          <g key={px}>
            <circle cx={px} cy="279" r="3.5" fill={url('metal')} stroke={INK} strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* blocos flutuando */}
      <Cube x={28} y={70} s={56} letra="P" cores={['#22d3c5', '#7befe4', '#128a80']} r={-10} />
      <Cube x={400} y={26} s={50} letra="L" cores={['#ffc917', '#ffe27a', '#b98d00']} r={9} delay="-1.4s" />
      <Cube x={418} y={268} s={46} letra="A" cores={['#8b5cf6', '#b9a0ff', '#5b33b8']} r={-7} delay="-2.6s" />
      <Cube x={24} y={300} s={52} letra="Y" cores={['#f8eedb', '#ffffff', '#cbb68c']} r={12} delay="-3.4s" />

      {/* brilhinhos */}
      <Sparkle x={110} y={150} s={9} cor="#ffc917" delay="0s" />
      <Sparkle x={380} y={150} s={7} cor="#f8eedb" delay="-1.1s" />
      <Sparkle x={470} y={200} s={6} cor="#ffc917" delay="-2.2s" />
      <Sparkle x={60} y={240} s={6} cor="#f8eedb" delay="-.6s" />
    </svg>
  );
}
