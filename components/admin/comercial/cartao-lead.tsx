import Link from "next/link";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { dataCurta } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { acaoVencida } from "@/lib/regras/comercial";
import type { Lead } from "@/lib/repositorios/comercial/leads";
import { cn } from "@/lib/utils";

const t = textos.comercial;

/** Cartão do funil: barbearia e contacto, próxima ação (realçada se vencida) e potencial. */
export function CartaoLead({
  lead,
  hoje,
  potencial,
}: {
  lead: Lead;
  hoje: string;
  potencial?: string;
}) {
  const vencida = acaoVencida(lead.proxima_acao_em, hoje);
  return (
    <Link
      href={`/admin/comercial/leads/${lead.id}`}
      data-testid="cartao-lead"
      className={cn(
        "cartao grid gap-1.5 rounded-xl p-3 text-sm transition-colors duration-200 ease-sistema hover:border-borda-forte",
        vencida && "border-destructive/40",
      )}
    >
      <span className="font-semibold">{lead.nome_barbearia || lead.nome_contacto}</span>
      <span className="text-xs text-muted-foreground">
        {[lead.nome_barbearia ? lead.nome_contacto : null, lead.cidade].filter(Boolean).join(" · ")}
      </span>
      {lead.proxima_acao ? (
        <span className="text-xs">
          {lead.proxima_acao}
          {lead.proxima_acao_em ? ` · ${dataCurta(`${lead.proxima_acao_em}T12:00:00Z`)}` : ""}
        </span>
      ) : null}
      <span className="flex flex-wrap items-center gap-1.5">
        {vencida ? <Etiqueta tom="perda">{t.funil.vencida}</Etiqueta> : null}
        {potencial ? (
          <Etiqueta tom="destaque">{formatarDinheiro(centimosDeNumeric(potencial))}</Etiqueta>
        ) : null}
      </span>
    </Link>
  );
}
