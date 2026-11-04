import type { ReactNode } from "react";

/** Uma opção grande, de toque (I.3, camada 4): título em negrito e uma linha secundária. */
export function Escolha({
  titulo,
  linha,
  lado,
  imagem,
  inicial,
  aoEscolher,
  testId,
}: {
  titulo: ReactNode;
  linha?: ReactNode;
  lado?: ReactNode;
  imagem?: string | null;
  /** Sem fotografia, a inicial num círculo (barbeiros, D-205). */
  inicial?: string;
  aoEscolher: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={aoEscolher}
      data-testid={testId}
      className="cartao-modelo flex min-h-16 w-full items-center gap-3 rounded-[var(--raio)] border bg-card p-4 text-left text-card-foreground transition-colors hover:border-primary active:translate-y-px"
    >
      {imagem ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
        <img src={imagem} alt="" className="size-12 rounded-full border object-cover" />
      ) : inicial ? (
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-lg font-bold text-primary"
        >
          {inicial}
        </span>
      ) : null}
      <span className="grid flex-1 gap-0.5">
        <span className="font-bold">{titulo}</span>
        {linha ? <span className="text-sm text-muted-foreground">{linha}</span> : null}
      </span>
      {lado ? <span className="numero font-bold">{lado}</span> : null}
    </button>
  );
}
