import { cn } from "@/lib/utils";

/** Um indicador numérico do Admin: rótulo pequeno e valor grande. */
export function Indicador({
  rotulo,
  valor,
  detalhe,
  alerta,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  alerta?: boolean;
}) {
  return (
    <div className="grid gap-1 rounded-lg border bg-card p-4">
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {rotulo}
      </span>
      <span className={cn("text-xl font-extrabold", alerta && "text-destructive")}>{valor}</span>
      {detalhe ? <span className="text-xs text-muted-foreground">{detalhe}</span> : null}
    </div>
  );
}
