import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Estado vazio: ícone discreto, uma frase que explica e, se houver, a ação que o resolve. */
export function EstadoVazio({
  icone: Icone,
  titulo,
  texto,
  acao,
}: {
  icone: LucideIcon;
  titulo: string;
  texto?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-accent text-ligacao">
        <Icone aria-hidden className="size-5" />
      </span>
      <p className="text-sm font-semibold">{titulo}</p>
      {texto ? <p className="max-w-sm text-sm text-muted-foreground">{texto}</p> : null}
      {acao}
    </div>
  );
}
