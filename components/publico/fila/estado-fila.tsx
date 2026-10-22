"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";
import { ATUALIZAR_FILA_SEGUNDOS } from "@/lib/publico/fila";

/** A posição na fila presencial e a espera estimada (F.4.3); a página volta a ler sozinha. */
export function EstadoFila({
  lingua,
  estado,
  posicao,
  minutos,
}: {
  lingua: Lingua;
  estado: "aguarda" | "em_atendimento" | "atendido" | "saiu";
  posicao: number;
  minutos: number;
}) {
  const f = textosPublicos(lingua).fila;
  const router = useRouter();
  const aguarda = estado === "aguarda";
  useEffect(() => {
    if (!aguarda) return;
    const id = setInterval(() => router.refresh(), ATUALIZAR_FILA_SEGUNDOS * 1000);
    return () => clearInterval(id);
  }, [aguarda, router]);
  if (estado === "em_atendimento")
    return (
      <p className="text-2xl font-extrabold" data-testid="estado-fila">
        {f.emAtendimento}
      </p>
    );
  if (!aguarda)
    return (
      <p className="text-xl font-bold" data-testid="estado-fila">
        {f.terminado}
      </p>
    );
  return (
    <div className="grid gap-3 text-center" data-testid="estado-fila" aria-live="polite">
      <p className="text-5xl font-extrabold tabular-nums">{f.lugar(posicao)}</p>
      <p className="text-lg font-semibold">
        {posicao <= 1 && minutos <= 5 ? f.aSeguir : f.espera(Math.max(minutos, 1))}
      </p>
      <p className="text-xs text-muted-foreground">{f.atualiza}</p>
    </div>
  );
}
