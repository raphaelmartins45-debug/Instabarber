"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";

/** Receita, custos e lucro dos últimos 12 meses (O.5): barras e a linha do lucro. */
export function GraficoFinancas({
  meses,
  series,
  descricao,
}: {
  meses: { rotulo: string; receita: number; custos: number; lucro: number }[];
  series: Record<string, string>;
  descricao: string;
}) {
  return (
    <figure className="h-64 w-full" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={meses} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="rotulo" tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            formatter={(v, nome) => [formatarDinheiro(Number(v)), series[String(nome)] ?? nome]}
          />
          <Legend formatter={(nome) => series[String(nome)] ?? nome} />
          <Bar dataKey="receita" fill="var(--color-destaque)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="custos" fill="var(--color-muted-foreground)" radius={[4, 4, 0, 0]} />
          <Line dataKey="lucro" stroke="var(--color-sucesso)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </figure>
  );
}
