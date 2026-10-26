import "server-only";
import { periodoDe } from "@/lib/admin/comprovativos";
import { variavelOpcional } from "@/lib/configuracao/ambiente";
import { hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { type Comprovativo, registarFaturaDoComprovativo } from "@/lib/repositorios/comprovativos";
import type { ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { type ConfigInvoiceXpress, emitirFaturaRecibo } from "./invoicexpress";

// Faturação da mensalidade pelo programa certificado (D-170). Desligada até haver, na Vercel,
// FATURACAO_PLATAFORMA=invoicexpress, INVOICEXPRESS_CONTA e INVOICEXPRESS_CHAVE. Desligada, tudo
// fica como antes: a fatura emite-se à mão no programa e regista-se em Pagamentos.

const t = textos.comprovativos.fatura;

export function configuracaoFaturacao(): ConfigInvoiceXpress | null {
  const conta = variavelOpcional("INVOICEXPRESS_CONTA");
  const chave = variavelOpcional("INVOICEXPRESS_CHAVE");
  if (variavelOpcional("FATURACAO_PLATAFORMA") !== "invoicexpress" || !conta || !chave) return null;
  return { conta, chave, iva: variavelOpcional("INVOICEXPRESS_IVA") || "IVA23" };
}

export type EstadoFatura =
  | { estado: "desligada" | "ja_tinha" | "falhou" }
  | { estado: "emitida"; numero: string };

/** Depois de aprovar: emite a fatura-recibo do período pago, se a faturação estiver ligada. */
export async function faturarComprovativo(
  bd: ClienteBD,
  c: Comprovativo,
  b: ConfiguracaoBarbearia,
): Promise<EstadoFatura> {
  const config = configuracaoFaturacao();
  if (!config) return { estado: "desligada" };
  if (c.fatura_id) return { estado: "ja_tinha" };
  const plano = textos.admin.planos[b.plano as "basic" | "pro"] ?? b.plano;
  const r = await emitirFaturaRecibo(config, {
    cliente: {
      nome: b.nome,
      nif: b.nif,
      email: b.email,
      morada: b.morada,
      codigoPostal: b.codigo_postal,
      cidade: b.cidade,
      codigo: b.slug,
    },
    item: t.item,
    descricao: t.descricao(plano, periodoDe(c)),
    assunto: t.assunto,
    corpo: t.corpo,
    totalCent: c.valor_centimos,
    data: c.pago_em,
    isento: lerRegimeIva(process.env.PRESTADORA_REGIME_IVA) === "isento",
  });
  if (!r.ok) return { estado: "falhou" };
  const ok = await registarFaturaDoComprovativo(bd, c.id, r.numero, hojeIso());
  return ok ? { estado: "emitida", numero: r.numero } : { estado: "falhou" };
}
