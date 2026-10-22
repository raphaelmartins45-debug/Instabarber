"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";

/** Barras dos seis meses, com o mês do relatório destacado (E.5, bloco 2). */
export function GraficoEvolucao({
  meses,
  atual,
  descricao,
}: {
  meses: { mes: string; rotulo: string; faturacaoCent: number }[];
  atual: string;
  descricao: string;
}) {
  return (
    <figure className="h-56 w-full" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={meses} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis dataKey="rotulo" tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            formatter={(v) => formatarDinheiro(Number(v))}
            labelFormatter={(l) => String(l)}
          />
          <Bar dataKey="faturacaoCent" radius={[4, 4, 0, 0]}>
            {meses.map((m) => (
              <Cell
                key={m.mes}
                fill={m.mes === atual ? "var(--color-destaque)" : "var(--color-muted-foreground)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}
