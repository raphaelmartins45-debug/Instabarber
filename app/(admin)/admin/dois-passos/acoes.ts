"use server";

import { redirect } from "next/navigation";
import { inicioDoPapel } from "@/lib/admin/acesso";
import { lerSuperAdmin } from "@/lib/admin/contexto";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaCodigoTotp } from "@/lib/validacao/acesso";

// Segundo fator TOTP do super_admin (B.6). Sem ele, a sessão fica em aal1 e o /admin não abre.

export type Inscricao = { fator: string; qr: string; segredo: string } | { erro: string };

/** Começa a inscrição de uma aplicação de autenticação (apaga tentativas por confirmar). */
export async function iniciarInscricao(): Promise<Inscricao> {
  await lerSuperAdmin();
  const bd = await criarClienteServidor();
  const { data: fatores } = await bd.auth.mfa.listFactors();
  for (const f of fatores?.all ?? []) {
    if (f.factor_type === "totp" && f.status !== "verified")
      await bd.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await bd.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "InstaBarber Admin",
  });
  if (error || !data) return { erro: "generico" };
  return { fator: data.id, qr: data.totp.qr_code, segredo: data.totp.secret };
}

/** Verifica o código de 6 dígitos; com ele certo, a sessão passa a aal2. */
export async function verificarCodigo(dados: {
  fator: string;
  codigo: string;
}): Promise<{ erro: string }> {
  const { papel } = await lerSuperAdmin();
  const v = esquemaCodigoTotp.safeParse(dados);
  if (!v.success) return { erro: "codigo" };
  const bd = await criarClienteServidor();
  const { error } = await bd.auth.mfa.challengeAndVerify({
    factorId: v.data.fator,
    code: v.data.codigo,
  });
  if (error) return { erro: "codigo" };
  redirect(inicioDoPapel(papel));
}
