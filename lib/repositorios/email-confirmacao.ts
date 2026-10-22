import type { ClienteBD } from "@/lib/supabase/tipos";

// E-mail de confirmação (F.4.12): os dados pedem-se uma só vez, logo depois de confirmar, pela
// função reclamar_email_confirmacao(); o resultado fica em mensagens (canal email).

export type DadosEmailConfirmacao = {
  marcacaoId: string;
  para: string;
  cliente: string;
  servico: string;
  barbeiro: string;
  inicio: string;
  fim: string;
  barbearia: string;
  morada: string | null;
  emailBarbearia: string | null;
  cancelamentoMin: number;
};

/** Nulo quando não há e-mail a enviar (sem funcionalidade, sem e-mail ou já enviado). */
export async function reclamarEmailConfirmacao(
  bd: ClienteBD,
  marcacaoId: string,
): Promise<DadosEmailConfirmacao | null> {
  const { data, error } = await bd.rpc("reclamar_email_confirmacao", { p_marcacao: marcacaoId });
  const l = data?.[0];
  if (error || !l) return null;
  return {
    marcacaoId,
    para: l.para,
    cliente: l.cliente,
    servico: l.servico,
    barbeiro: l.barbeiro,
    inicio: l.inicio,
    fim: l.fim,
    barbearia: l.barbearia,
    morada: l.morada || null,
    emailBarbearia: l.email_barbearia,
    cancelamentoMin: l.cancelamento_min,
  };
}

export async function registarEmailConfirmacao(
  bd: ClienteBD,
  marcacaoId: string,
  enviado: boolean,
): Promise<void> {
  await bd.rpc("registar_email_confirmacao", { p_marcacao: marcacaoId, p_enviado: enviado });
}
