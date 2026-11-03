import type { Campanha } from "@/lib/comercial/campanhas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.campanhas;
const planos = textos.comercial.briefing.planos;
const periodicidades = textos.comercial.briefing.periodicidades;
const pacotes = textos.comercial.briefing.implementacoes;

/** O que a campanha oferece, em linhas curtas (D-190). */
export function resumoDaCampanha(c: Campanha): string[] {
  const r = t.resumo;
  return [
    t.planos(c.planos.map((p) => planos[p] ?? p).join(" e ")),
    c.periodicidade ? t.periodicidade(periodicidades[c.periodicidade] ?? c.periodicidade) : null,
    c.implementacao && c.implementacao !== "nenhuma"
      ? c.implementacaoCent === 0
        ? r.implementacaoOferta(pacotes[c.implementacao]!)
        : c.implementacaoCent !== null
          ? r.implementacaoPreco(pacotes[c.implementacao]!, formatarDinheiro(c.implementacaoCent))
          : null
      : null,
    c.meses_oferta ? r.mesesOferta(c.meses_oferta) : null,
    c.primeiro_mes_gratis ? r.primeiroMes : null,
    c.desconto_temporario_pct ? r.desconto(c.desconto_temporario_pct, c.meses_condicao) : null,
    c.profissionais_gratis ? r.profissionais(c.profissionais_gratis, c.meses_condicao) : null,
    c.dominio_gratis ? r.dominio(c.meses_condicao) : null,
  ].filter((l): l is string => !!l);
}
