import type { IconType } from 'react-icons';
import {
  GiBearFace,
  GiRobotGolem,
  GiPuzzle,
  GiRaceCar,
  GiDiceSixFacesFive,
  GiCube,
  GiSpinningTop,
  GiBalloons,
  GiDinosaurRex,
  GiSoccerBall,
  GiPaintBrush,
  GiToyMallet,
} from 'react-icons/gi';
import { FaGamepad } from 'react-icons/fa';

interface ToyTheme {
  Icon: IconType;
  bg: string;
}

const PALETA = ['#d01b2b', '#22d3c5', '#8b5cf6', '#ffc917', '#2f6fe0', '#ff7a1a', '#3fbf5f', '#e2468f'];

const REGRAS: { termos: string[]; Icon: IconType; bg: string }[] = [
  { termos: ['pelucia', 'urso', 'ursinho', 'bicho'], Icon: GiBearFace, bg: '#e2468f' },
  { termos: ['robo', 'robot', 'eletron'], Icon: GiRobotGolem, bg: '#2f6fe0' },
  { termos: ['quebra', 'puzzle'], Icon: GiPuzzle, bg: '#8b5cf6' },
  { termos: ['carro', 'carrinho', 'veiculo', 'hot wheels', 'pista'], Icon: GiRaceCar, bg: '#d01b2b' },
  { termos: ['tabuleiro', 'dado', 'cartas', 'jogo de mesa'], Icon: GiDiceSixFacesFive, bg: '#ffc917' },
  { termos: ['videogame', 'game', 'console', 'controle'], Icon: FaGamepad, bg: '#22d3c5' },
  { termos: ['bloco', 'lego', 'montar', 'construcao', 'encaixe'], Icon: GiCube, bg: '#ff7a1a' },
  { termos: ['dino', 'dinossauro', 'boneco', 'boneca', 'figura', 'acao'], Icon: GiDinosaurRex, bg: '#3fbf5f' },
  { termos: ['bola', 'esporte', 'futebol'], Icon: GiSoccerBall, bg: '#2f6fe0' },
  { termos: ['arte', 'pintura', 'massinha', 'desenho', 'educativo'], Icon: GiPaintBrush, bg: '#8b5cf6' },
  { termos: ['festa', 'balao'], Icon: GiBalloons, bg: '#e2468f' },
  { termos: ['pião', 'piao', 'classico', 'madeira'], Icon: GiSpinningTop, bg: '#ff7a1a' },
];

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Escolhe ícone e cor de fundo a partir da categoria (ou do nome) do produto. */
export function toyTheme(categoria?: string, nome?: string, id = 0): ToyTheme {
  const texto = normalizar(`${categoria || ''} ${nome || ''}`);
  const regra = REGRAS.find((r) => r.termos.some((t) => texto.includes(normalizar(t))));
  if (regra) return { Icon: regra.Icon, bg: regra.bg };
  return { Icon: GiToyMallet, bg: PALETA[Math.abs(id) % PALETA.length] };
}

interface Props {
  categoria?: string;
  nome?: string;
  id?: number;
  className?: string;
  children?: React.ReactNode;
}

/** Área de "imagem" do brinquedo — ilustração gerada pela categoria. */
export default function ToyArt({ categoria, nome, id = 0, className = '', children }: Props) {
  const { Icon, bg } = toyTheme(categoria, nome, id);
  return (
    <div className={`toy-art ${className}`} style={{ background: bg }}>
      <Icon className="toy-icon" aria-hidden />
      {children}
    </div>
  );
}

/** Miniatura quadrada para listas e tabelas. */
export function ToyThumb({ categoria, nome, id = 0, size = 44 }: { categoria?: string; nome?: string; id?: number; size?: number }) {
  const { Icon, bg } = toyTheme(categoria, nome, id);
  return (
    <span
      className="inline-grid place-items-center shrink-0"
      style={{
        width: size,
        height: size,
        background: bg,
        border: '2.5px solid var(--ink)',
        borderRadius: 10,
        boxShadow: '2px 2px 0 var(--ink)',
      }}
    >
      <Icon style={{ width: size * 0.58, height: size * 0.58, color: 'var(--paper)', filter: 'drop-shadow(2px 2px 0 var(--ink))' }} aria-hidden />
    </span>
  );
}
