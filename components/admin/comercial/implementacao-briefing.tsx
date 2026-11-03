import type { UseFormReturn } from "react-hook-form";
import { type CondicoesComerciais, precoImplementacaoCent } from "@/lib/comercial/condicoes";
import type { DadosBriefing } from "@/lib/comercial/briefing";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { CampoBriefing, SelecaoBriefing } from "./campos-briefing";

const t = textos.comercial.briefing;
const pct = (v: unknown) => Math.max(0, Math.min(100, Number(v) || 0));

/** A implementação da proposta (D-189): o pacote, o desconto e o valor que fica na proposta. */
export function ImplementacaoBriefing({
  form,
  condicoes,
  administrador,
}: {
  form: UseFormReturn<DadosBriefing>;
  condicoes: CondicoesComerciais;
  administrador: boolean;
}) {
  const implementacao = form.watch("implementacao") ?? "nenhuma";
  const valor = precoImplementacaoCent(
    condicoes,
    implementacao,
    pct(form.watch("desconto_taxa_pct")),
  );
  return (
    <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
      <SelecaoBriefing form={form} nome="implementacao" opcoes={t.implementacoes} />
      {implementacao === "nenhuma" ? null : (
        <div className="grid gap-1">
          <CampoBriefing form={form} nome="desconto_taxa_pct" tipo="number" />
          <p className="text-xs text-muted-foreground" data-testid="valor-implementacao">
            {administrador ? null : `${t.limite(condicoes.descontoMaxTaxa)} `}
            {t.taxa(formatarDinheiro(valor))}
          </p>
        </div>
      )}
    </div>
  );
}
