import { cn } from "@/lib/utils";

/**
 * Um indicador (KPI): rótulo pequeno, valor grande em algarismos tabulares que não mudam de largura
 * ao atualizar, e uma linha de detalhe. Em perda, o valor ganha a cor e um brilho suave (D-134).
 */
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
    <div className="cartao grid animate-entrada content-start gap-1.5 rounded-2xl p-4 md:p-5">
      <span className="rotulo">{rotulo}</span>
      <span
        className={cn(
          "numero text-2xl font-bold tracking-tight md:text-[28px]",
          alerta && "text-destructive [text-shadow:0_0_24px_rgba(240,120,107,.35)]",
        )}
      >
        {valor}
      </span>
      {detalhe ? <span className="text-xs text-muted-foreground">{detalhe}</span> : null}
    </div>
  );
}
