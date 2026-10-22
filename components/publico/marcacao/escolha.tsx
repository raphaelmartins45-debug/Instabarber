import type { ReactNode } from "react";

/** Uma opção grande, de toque (I.3, camada 4): título em negrito e uma linha secundária. */
export function Escolha({
  titulo,
  linha,
  lado,
  imagem,
  aoEscolher,
  testId,
}: {
  titulo: ReactNode;
  linha?: ReactNode;
  lado?: ReactNode;
  imagem?: string | null;
  aoEscolher: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={aoEscolher}
      data-testid={testId}
      className="flex min-h-16 w-full items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-muted"
    >
      {imagem ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
        <img src={imagem} alt="" className="size-12 rounded-full border object-cover" />
      ) : null}
      <span className="grid flex-1 gap-0.5">
        <span className="font-bold">{titulo}</span>
        {linha ? <span className="text-sm text-muted-foreground">{linha}</span> : null}
      </span>
      {lado ? <span className="font-bold tabular-nums">{lado}</span> : null}
    </button>
  );
}
