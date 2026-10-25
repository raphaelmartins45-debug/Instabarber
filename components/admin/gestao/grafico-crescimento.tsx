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
  YAxis,
} from "recharts";

/** Novas e saídas (barras) e ativas no fim do mês (linha), nos últimos 12 meses (D-159). */
export function GraficoCrescimento({
  meses,
  series,
  descricao,
}: {
  meses: { rotulo: string; novas: number; saidas: number; ativasFim: number }[];
  series: Record<string, string>;
  descricao: string;
}) {
  return (
    <figure className="h-64 w-full" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={meses} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="rotulo" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            formatter={(v, nome) => [Number(v), series[String(nome)] ?? nome]}
          />
          <Legend formatter={(nome) => series[String(nome)] ?? nome} />
          <Bar dataKey="novas" fill="var(--color-destaque)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="saidas" fill="var(--color-muted-foreground)" radius={[4, 4, 0, 0]} />
          <Line dataKey="ativasFim" stroke="var(--color-sucesso)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </figure>
  );
}
