"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { type DadosBriefing, MODELOS_CAIXA } from "@/lib/comercial/briefing";
import { profissionaisDoPlano } from "@/lib/comercial/proposta";
import { centimosDeTexto, formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { calcularPrecoCent, type RegimeIva } from "@/lib/regras/mensalidade";
import { CaixaBriefing, CampoBriefing, EscolhasBriefing, SelecaoBriefing } from "./campos-briefing";

const t = textos.comercial.briefing;
type Form = UseFormReturn<DadosBriefing>;

/** Valor da visita em euros, guardado em cêntimos (CLAUDE.md §5). */
function ValorVisita({ form }: { form: Form }) {
  const inicial = form.getValues("valor_visita_cent");
  const [texto, setTexto] = useState(inicial ? textoDeCentimos(inicial) : "");
  return (
    <Campo
      id="briefing-valor_visita"
      rotulo={t.campos.valor_visita_cent!}
      inputMode="decimal"
      value={texto}
      onChange={(e) => {
        setTexto(e.target.value);
        form.setValue("valor_visita_cent", centimosDeTexto(e.target.value) ?? undefined);
      }}
    />
  );
}

/** O preço do plano recomendado, em tempo real, com a fórmula única (D.7). */
function Preco({ form, regime }: { form: Form; regime: RegimeIva }) {
  const v = form.watch();
  const plano = v.plano ?? "pro";
  const n = profissionaisDoPlano({ plano, profissionais: Number(v.profissionais ?? 3) });
  const p = calcularPrecoCent(plano, n, v.periodicidade ?? "mensal", !!v.dominio_proprio, regime);
  return (
    <p
      className="numero rounded-xl bg-accent px-4 py-3 text-sm font-semibold"
      data-testid="preco-briefing"
    >
      {t.preco(formatarDinheiro(p.comIva), formatarDinheiro(p.semIva))}
    </p>
  );
}

/** Os campos de cada um dos sete passos (N.4). */
export function PassoBriefing({
  form,
  passo,
  regime,
}: {
  form: Form;
  passo: number;
  regime: RegimeIva;
}) {
  const caixa = Object.fromEntries(MODELOS_CAIXA.map((m) => [m, m]));
  switch (passo) {
    case 0:
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              "nome_comercial",
              "firma",
              "nif",
              "morada",
              "cidade",
              "ano_abertura",
              "horario",
            ] as const
          ).map((n) => (
            <CampoBriefing key={n} form={form} nome={n} />
          ))}
          <CampoBriefing form={form} nome="cadeiras" tipo="number" />
        </div>
      );
    case 1:
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <CampoBriefing form={form} nome="n_barbeiros" tipo="number" />
          <SelecaoBriefing form={form} nome="modelo_caixa" opcoes={caixa} />
          <CampoBriefing form={form} nome="regimes" />
          <CampoBriefing form={form} nome="quem_decide" />
        </div>
      );
    case 2:
      return (
        <div className="grid gap-4">
          <EscolhasBriefing form={form} nome="como_marcam" opcoes={t.comoMarcam} />
          <div className="grid gap-4 md:grid-cols-2">
            <CampoBriefing form={form} nome="sistema_atual" />
            <CampoBriefing form={form} nome="custo_sistema" />
            <CampoBriefing form={form} nome="clientes_ativos" tipo="number" />
            <ValorVisita form={form} />
            <CampoBriefing form={form} nome="faltas_semana" tipo="number" />
            <CampoBriefing form={form} nome="clientes_perdidos" tipo="number" />
          </div>
        </div>
      );
    case 3:
      return (
        <div className="grid gap-4">
          <EscolhasBriefing form={form} nome="dores" opcoes={t.dores} />
          <CampoBriefing form={form} nome="objetivo" />
        </div>
      );
    case 4:
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <SelecaoBriefing form={form} nome="plano" opcoes={t.planos} />
          <CampoBriefing form={form} nome="profissionais" tipo="number" />
          <SelecaoBriefing form={form} nome="periodicidade" opcoes={t.periodicidades} />
          <CaixaBriefing form={form} nome="dominio_proprio" />
          <div className="md:col-span-2">
            <Preco form={form} regime={regime} />
          </div>
        </div>
      );
    case 5:
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <CampoBriefing form={form} nome="condicoes_lancamento" />
          <CampoBriefing form={form} nome="validade_dias" tipo="number" />
          <CampoBriefing form={form} nome="data_arranque" tipo="date" />
          <CaixaBriefing form={form} nome="desafio_90" />
        </div>
      );
    default:
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <CampoBriefing form={form} nome="decisor_nome" />
          <CampoBriefing form={form} nome="decisor_cargo" />
          <CampoBriefing form={form} nome="decisor_email" tipo="email" />
          <CampoBriefing form={form} nome="decisor_telemovel" tipo="tel" />
        </div>
      );
  }
}
