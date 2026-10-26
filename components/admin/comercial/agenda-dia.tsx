import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ItemAgenda } from "@/lib/comercial/agenda";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoParaTelefone } from "@/lib/regras/whatsapp";

const t = textos.comercial.agenda;
const m = textos.comercial.mensagens.textos;

/** A mensagem pronta de cada tipo de tarefa (D-162). */
function mensagem(i: ItemAgenda): string {
  if (i.tipo === "risco") return m.acompanhamento(i.nome);
  if (i.tipo === "proposta") return m.proposta(i.nome, i.numero);
  if (i.tipo === "contrato") return m.fimContrato(i.nome);
  return m.seguimento(i.nome);
}

/** A agenda do dia do comercial (D-162): o que fazer hoje, com o WhatsApp pronto a abrir. */
export function AgendaDia({ itens }: { itens: ItemAgenda[] }) {
  if (itens.length === 0) return <p className="text-sm text-muted-foreground">{t.vazio}</p>;
  return (
    <ul className="grid gap-2" data-testid="agenda">
      {itens.map((i) => {
        const wa = ligacaoParaTelefone(i.telefone, mensagem(i));
        const chave = i.tipo === "risco" ? `r-${i.inquilinoId}` : `${i.tipo}-${i.leadId}`;
        return (
          <li
            key={chave}
            className="cartao flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
          >
            <div className="grid gap-0.5">
              <span className="font-semibold">{i.nome}</span>
              <span
                className={
                  i.tipo === "risco" ? "text-sm text-destructive" : "text-sm text-muted-foreground"
                }
              >
                {i.tipo === "risco"
                  ? t.risco
                  : i.tipo === "proposta"
                    ? t.proposta(i.numero, i.dias)
                    : i.tipo === "contrato"
                      ? t.contrato(i.dias)
                      : `${t.acao(i.atraso)}${i.texto ? `: ${i.texto}` : ""}`}
              </span>
            </div>
            <div className="flex gap-2">
              {wa ? (
                <Button asChild size="sm" variant="outline">
                  <a href={wa} target="_blank" rel="noreferrer">
                    {t.whatsapp}
                  </a>
                </Button>
              ) : null}
              {i.tipo !== "risco" ? (
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/admin/comercial/leads/${i.leadId}`}>{t.abrir}</Link>
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
