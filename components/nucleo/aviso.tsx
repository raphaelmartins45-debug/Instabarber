import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Mensagem curta de resultado: erro (vermelho) ou confirmação (verde). */
export function Aviso({ tipo, children }: { tipo: "erro" | "sucesso"; children: ReactNode }) {
  return (
    <p
      role={tipo === "erro" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        tipo === "erro"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-sucesso/30 bg-sucesso/5 text-sucesso",
      )}
    >
      {children}
    </p>
  );
}
