import { Etiqueta, type TomEtiqueta } from "@/components/nucleo/etiqueta";
import { dataCurta } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { primeiroNome } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import type { Lead } from "@/lib/repositorios/comercial/leads";
import type { Proposta } from "@/lib/repositorios/comercial/propostas";
import { AcoesProposta } from "./acoes-proposta";

const t = textos.comercial.propostas;

/** wa.me só com um telefone válido; sem ele, o botão não aparece. */
function whatsappOuNada(telefone: string | null, texto: string): string | null {
  try {
    return telefone ? ligacaoWhatsApp(telefone, texto) : null;
  } catch {
    return null;
  }
}

export const TOM_PROPOSTA: Record<string, TomEtiqueta> = {
  rascunho: "neutro",
  enviada: "info",
  aceite: "sucesso",
  recusada: "perda",
  substituida: "neutro",
  expirada: "alerta",
};

/** Propostas do lead, da versão mais recente para a mais antiga (N.5). */
export function ListaPropostas({ lead, propostas }: { lead: Lead; propostas: Proposta[] }) {
  if (propostas.length === 0) return <p className="text-sm text-muted-foreground">{t.vazio}</p>;
  return (
    <ul className="grid gap-3" data-testid="propostas-lead">
      {propostas.map((p) => {
        const estado = p.estado_efetivo ?? p.estado ?? "rascunho";
        const texto = t.textoEnvio(primeiroNome(lead.nome_contacto), p.numero ?? "");
        return (
          <li key={p.id} className="cartao grid gap-3 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">
                {p.numero} · {t.versao(p.versao ?? 1)}
              </span>
              <Etiqueta tom={TOM_PROPOSTA[estado] ?? "neutro"}>{t.estados[estado]}</Etiqueta>
            </div>
            <p className="numero text-sm text-muted-foreground">
              {formatarDinheiro(centimosDeNumeric(String(p.valor_periodo_com_iva)))}
              {p.valida_ate
                ? ` · ${t.colunas.validade} ${dataCurta(`${p.valida_ate}T12:00:00Z`)}`
                : ""}
            </p>
            <AcoesProposta
              leadId={lead.id}
              id={p.id!}
              estado={estado}
              whatsapp={whatsappOuNada(lead.telefone, texto)}
              email={
                lead.email
                  ? `mailto:${lead.email}?subject=${encodeURIComponent(t.assuntoEnvio(p.numero ?? ""))}&body=${encodeURIComponent(texto)}`
                  : null
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
