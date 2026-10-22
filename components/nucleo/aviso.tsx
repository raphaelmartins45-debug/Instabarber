import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mensagem curta de resultado: erro (vermelho) ou confirmação (verde). */
export function Aviso({ tipo, children }: { tipo: "erro" | "sucesso"; children: ReactNode }) {
  return (
    <p
      role={tipo === "erro" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm animate-entrada",
        tipo === "erro"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-sucesso/30 bg-sucesso/10 text-sucesso",
      )}
    >
      {children}
    </p>
  );
}
