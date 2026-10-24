"use client";

import { useState } from "react";
import { Campo } from "@/components/nucleo/campo";
import { centimosDeTexto, formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { formatarPercentagem } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import {
  CENARIOS,
  eSeTiver,
  mesDaMeta,
  mesDoEquilibrio,
  pressupostosDoCenario,
  projetar,
} from "@/lib/regras/previsao";
import { GraficoPrevisao } from "./grafico-previsao";

const t = textos.financas.previsao;
const numero = (v: string) => {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/**
 * Previsões a 12 meses (O.8): três cenários com os pressupostos à vista. Mudar um pressuposto
 * recalcula tudo na hora, sem gravar nada.
 */
export function Previsao(p: {
  mrrInicial: number;
  meses: { mes: string; rotulo: string; extenso: string }[];
  custos: number[];
  novas: number;
  saidas: number;
  declarada: boolean;
  valorMedio: number;
  metaCent: number | null;
  valorPro: number;
  custosMes: number;
}) {
  const [novas, setNovas] = useState(String(Math.round(p.novas * 10) / 10).replace(".", ","));
  const [saidas, setSaidas] = useState(String(Math.round(p.saidas * 1000) / 10).replace(".", ","));
  const [valor, setValor] = useState(textoDeCentimos(p.valorMedio));
  const [n, setN] = useState("10");
  const pressupostos = {
    novas: numero(novas),
    saidas: numero(saidas) / 100,
    valorMedio: centimosDeTexto(valor) ?? p.valorMedio,
  };
  const meses = p.meses.map((m) => m.mes);
  const cenarios = Object.fromEntries(
    CENARIOS.map((c) => [
      c,
      projetar(p.mrrInicial, pressupostosDoCenario(pressupostos, c), meses, p.custos),
    ]),
  );
  const base = cenarios.base!;
  const extenso = (mes: string | null) =>
    (mes && p.meses.find((m) => m.mes === mes)?.extenso) || t.nunca;
  const linhas = p.meses.map((m, i) => ({
    rotulo: m.rotulo,
    pessimista: cenarios.pessimista![i]!.mrr,
    base: base[i]!.mrr,
    otimista: cenarios.otimista![i]!.mrr,
    custos: p.custos[i] ?? 0,
  }));
  const eSe = eSeTiver(numero(n), p.valorPro, p.custosMes);
  return (
    <div className="grid gap-4" data-testid="previsao">
      <p className="rounded-xl border border-alerta/30 bg-alerta/10 p-3 text-sm font-semibold">
        {t.aviso}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo
          id="prev-novas"
          inputMode="decimal"
          rotulo={t.novas}
          value={novas}
          onChange={(e) => setNovas(e.target.value)}
        />
        <Campo
          id="prev-saidas"
          inputMode="decimal"
          rotulo={t.saidas}
          ajuda={p.declarada ? t.declarada : undefined}
          value={saidas}
          onChange={(e) => setSaidas(e.target.value)}
        />
        <Campo
          id="prev-valor"
          inputMode="decimal"
          rotulo={t.valorMedio}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
      </div>
      <GraficoPrevisao
        linhas={linhas}
        series={{ ...t.cenarios, custos: t.custos }}
        descricao={t.titulo}
      />
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="cartao grid gap-1 rounded-2xl p-4">
          <dt className="rotulo">{t.equilibrio}</dt>
          <dd className="font-semibold" data-testid="previsao-equilibrio">
            {extenso(mesDoEquilibrio(base))}
          </dd>
        </div>
        {p.metaCent ? (
          <div className="cartao grid gap-1 rounded-2xl p-4">
            <dt className="rotulo">{t.meta}</dt>
            <dd className="font-semibold">{extenso(mesDaMeta(base, p.metaCent))}</dd>
          </div>
        ) : null}
        {CENARIOS.map((c) => (
          <div key={c} className="cartao grid gap-1 rounded-2xl p-4">
            <dt className="rotulo">{t.mrrFinal(t.cenarios[c]!)}</dt>
            <dd className="numero font-semibold" data-testid={`previsao-${c}`}>
              {formatarDinheiro(cenarios[c]!.at(-1)?.mrr ?? 0)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="cartao grid gap-3 rounded-2xl p-4">
        <p className="font-semibold">{t.eSe}</p>
        <Campo
          id="prev-n"
          inputMode="numeric"
          rotulo={t.n}
          value={n}
          onChange={(e) => setN(e.target.value)}
        />
        <p className="text-sm" data-testid="previsao-ese">
          {t.eSeResultado(
            formatarDinheiro(eSe.mrr),
            formatarDinheiro(eSe.lucro),
            eSe.margem === null ? textos.financas.resumo.semValor : formatarPercentagem(eSe.margem),
          )}
        </p>
      </div>
    </div>
  );
}
