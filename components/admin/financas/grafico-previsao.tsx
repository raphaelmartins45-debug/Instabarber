"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";

/** MRR dos três cenários e os custos, mês a mês (O.8). */
export function GraficoPrevisao({
  linhas,
  series,
  descricao,
}: {
  linhas: Record<string, number | string>[];
  series: Record<string, string>;
  descricao: string;
}) {
  return (
    <figure className="h-64 w-full" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={linhas} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="rotulo" tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            formatter={(v, nome) => [formatarDinheiro(Number(v)), series[String(nome)] ?? nome]}
          />
          <Legend formatter={(nome) => series[String(nome)] ?? nome} />
          <Line dataKey="pessimista" stroke="var(--color-muted-foreground)" dot={false} />
          <Line dataKey="base" stroke="var(--color-destaque)" strokeWidth={2} dot={false} />
          <Line dataKey="otimista" stroke="var(--color-sucesso)" dot={false} />
          <Line
            dataKey="custos"
            stroke="var(--color-destructive)"
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
