import "server-only";
import {
  avisoComprovativo,
  emailComprovativoRecusado,
  emailPagamentoConfirmado,
} from "@/lib/email/comprovativos";
import { enviarEmail } from "@/lib/email/enviar";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { precoDaBarbearia } from "@/lib/regras/receita";
import type { Comprovativo } from "@/lib/repositorios/comprovativos";
import type { ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";

// Os e-mails dos comprovativos (D-168), montados num só sítio com os dados da barbearia.

const t = textos.comprovativos;
const dia = (d: string) => dataCurta(`${d}T12:00:00Z`);

export const periodoDe = (c: { periodo_inicio: string; periodo_fim: string }) =>
  `${dia(c.periodo_inicio)} – ${dia(c.periodo_fim)}`;

/** A mensalidade com IVA da barbearia (D.7), para comparar com o valor pago. */
export const mensalidadeCent = (b: ConfiguracaoBarbearia) =>
  precoDaBarbearia(b, lerRegimeIva(process.env.PRESTADORA_REGIME_IVA)).comIva;

export function avisarComprovativo(
  b: ConfiguracaoBarbearia,
  c: Comprovativo,
  fatura: string | null,
  ligacao: string,
): Promise<boolean> {
  return enviarEmail(() =>
    avisoComprovativo({
      barbearia: b.nome,
      responsavel: b.responsavel ?? textos.comum.vazio,
      plano: textos.admin.planos[b.plano as "basic" | "pro"] ?? b.plano,
      periodicidade: textos.admin.periodicidades[b.periodicidade as "mensal" | "anual"],
      periodo: periodoDe(c),
      fatura: fatura ?? t.admin.campos.semFatura,
      esperado: formatarDinheiro(mensalidadeCent(b)),
      valor: formatarDinheiro(c.valor_centimos),
      metodo: t.metodos[c.metodo] ?? c.metodo,
      data: dia(c.pago_em),
      ligacao,
    }),
  );
}

/** Responde à barbearia depois da decisão; sem e-mail registado, não envia (devolve false). */
export function responderBarbearia(b: ConfiguracaoBarbearia, c: Comprovativo): Promise<boolean> {
  if (!b.email) return Promise.resolve(false);
  const responsavel = b.responsavel ?? b.nome;
  if (c.estado === "recusado")
    return enviarEmail(() =>
      emailComprovativoRecusado(b.email!, b.nome, {
        responsavel,
        periodo: periodoDe(c),
        motivo: c.motivo ?? "",
      }),
    );
  return enviarEmail(() =>
    emailPagamentoConfirmado(b.email!, {
      responsavel,
      barbearia: b.nome,
      periodo: periodoDe(c),
      valor: formatarDinheiro(c.valor_centimos),
      metodo: t.metodos[c.metodo] ?? c.metodo,
      data: dia(c.pago_em),
      vencimento: b.proximo_vencimento ? dia(b.proximo_vencimento) : textos.comum.vazio,
    }),
  );
}
