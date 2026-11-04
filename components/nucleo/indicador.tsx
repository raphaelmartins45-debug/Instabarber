import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Um indicador (KPI): rótulo pequeno, valor em algarismos tabulares que não mudam de largura ao
 * atualizar e uma linha de detalhe. Compacto e sem animação, porque se vê muitas vezes por dia
 * (D-183); em perda, o valor ganha só a cor.
 */
export function Indicador({
  rotulo,
  valor,
  detalhe,
  alerta,
  children,
}: {
  rotulo: string;
  valor: string;
  detalhe?: ReactNode;
  alerta?: boolean;
  /** Um gráfico pequeno por baixo (barra de objetivo), D-203. */
  children?: ReactNode;
}) {
  return (
    <div className="cartao grid content-start gap-1 rounded-xl px-4 py-3.5">
      <span className="rotulo">{rotulo}</span>
      <span
        className={cn(
          "numero text-xl font-bold tracking-tight md:text-2xl",
          alerta && "text-destructive",
        )}
      >
        {valor}
      </span>
      {detalhe ? <span className="text-xs text-muted-foreground">{detalhe}</span> : null}
      {children}
    </div>
  );
}
