import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { DadosBriefing } from "@/lib/comercial/briefing";
import { campanhasDisponiveis } from "@/lib/comercial/campanhas";
import { type CondicoesComerciais, precoImplementacaoCent } from "@/lib/comercial/condicoes";
import { hojeIso } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { CampoBriefing, SelecaoBriefing } from "./campos-briefing";

const t = textos.comercial.briefing;
const pct = (v: unknown) => Math.max(0, Math.min(100, Number(v) || 0));

/**
 * A implementação e a condição especial da proposta (D-189, D-190). A lista de condições mostra só
 * as campanhas ligadas que servem para o plano; uma campanha pode fixar o pacote e o preço.
 */
export function ImplementacaoBriefing({
  form,
  condicoes,
  administrador,
}: {
  form: UseFormReturn<DadosBriefing>;
  condicoes: CondicoesComerciais;
  administrador: boolean;
}) {
  const plano = form.watch("plano") ?? "pro";
  const disponiveis = campanhasDisponiveis(condicoes.campanhas ?? [], plano, hojeIso());
  const campanha = disponiveis.find((c) => c.id === form.watch("campanha_id")) ?? null;
  const implementacao = form.watch("implementacao") ?? "nenhuma";
  // A campanha fixa o pacote; ao mudar de plano, uma campanha que já não serve sai.
  useEffect(() => {
    if (campanha?.implementacao) form.setValue("implementacao", campanha.implementacao);
  }, [campanha, form]);
  useEffect(() => {
    const escolhida = form.getValues("campanha_id");
    if (escolhida && !disponiveis.some((c) => c.id === escolhida)) form.setValue("campanha_id", "");
  }, [disponiveis, form]);
  const valor =
    campanha?.implementacaoCent ??
    precoImplementacaoCent(condicoes, implementacao, pct(form.watch("desconto_taxa_pct")));
  return (
    <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
      {disponiveis.length ? (
        <label className="grid min-w-0 gap-1.5 md:col-span-2">
          <span className="rotulo">{t.campos.campanha_id}</span>
          <select
            {...form.register("campanha_id")}
            className="h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="">{t.semCampanha}</option>
            {disponiveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {campanha ? (
            <span className="text-xs text-muted-foreground" data-testid="texto-campanha">
              {campanha.texto}
              {campanha.periodicidade
                ? ` ${t.campanhaPeriodicidade(t.periodicidades[campanha.periodicidade]!)}`
                : ""}
            </span>
          ) : null}
        </label>
      ) : null}
      {campanha?.implementacao ? null : condicoes.taxaAtiva ? (
        <SelecaoBriefing form={form} nome="implementacao" opcoes={t.implementacoes} />
      ) : null}
      {implementacao === "nenhuma" || (campanha?.implementacao && !condicoes.taxaAtiva) ? null : (
        <div className="grid gap-1">
          {campanha?.implementacaoCent !== null && campanha ? null : (
            <CampoBriefing form={form} nome="desconto_taxa_pct" tipo="number" />
          )}
          <p className="text-xs text-muted-foreground" data-testid="valor-implementacao">
            {administrador || campanha ? null : `${t.limite(condicoes.descontoMaxTaxa)} `}
            {t.taxa(formatarDinheiro(valor))}
          </p>
        </div>
      )}
    </div>
  );
}
