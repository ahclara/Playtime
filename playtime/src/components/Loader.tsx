export default function Loader({ label = 'Carregando...', dark = false }: { label?: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10" role="status">
      <span className="loader" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      <span className={`mono text-xs tracking-[0.2em] uppercase ${dark ? 'text-[#6b5d55]' : 'text-[var(--muted)]'}`}>{label}</span>
    </div>
  );
}
