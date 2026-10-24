"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { emailLembreteVencimento } from "@/lib/email/lembrete-vencimento";
import { enviarEmail } from "@/lib/email/enviar";
import { dataCurta } from "@/lib/formatacao/datas";
import {
  abrirLembrete,
  cancelarLembrete,
  confirmarLembrete,
  lembreteParaReenviar,
  listarVencimentos,
  prepararLembrete,
  registarEmailLembrete,
} from "@/lib/repositorios/vencimentos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Lembretes de vencimento (O.9). O WhatsApp regista a ligação aberta e só fica confirmado à mão;
// o e-mail sai no clique, pelo Resend, e fica «enviado» ou «falhou». Nada agendado (D-16).

type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string };
const texto = z.string().trim().min(1).max(2000);
const uuid = z.string().uuid();

const revalidar = () => {
  revalidatePath("/admin/financas/vencimentos");
  revalidatePath("/admin");
};

/** Prepara o lembrete de WhatsApp e regista que a conversa foi aberta. */
export async function abrirWhatsapp(
  inquilinoId: string,
  conteudo: string,
): Promise<Resultado<{ id: string }>> {
  await exigirSuperAdmin();
  const v = texto.safeParse(conteudo);
  if (!v.success || !uuid.safeParse(inquilinoId).success)
    return { ok: false, erro: "texto_obrigatorio" };
  const bd = await criarClienteServidor();
  const p = await prepararLembrete(bd, inquilinoId, "whatsapp", v.data);
  if ("erro" in p) return { ok: false, erro: p.erro };
  const erro = await abrirLembrete(bd, p.id);
  revalidar();
  return erro ? { ok: false, erro } : { ok: true, id: p.id };
}

export async function confirmarWhatsapp(id: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const erro = await confirmarLembrete(await criarClienteServidor(), id);
  revalidar();
  return erro ? { ok: false, erro } : { ok: true };
}

export async function cancelar(id: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const erro = await cancelarLembrete(await criarClienteServidor(), id);
  revalidar();
  return erro ? { ok: false, erro } : { ok: true };
}

/** Prepara e envia o e-mail no momento do clique; regista «enviado» ou «falhou». */
export async function enviarPorEmail(
  inquilinoId: string,
  conteudo: string,
): Promise<Resultado<{ enviado: boolean }>> {
  await exigirSuperAdmin();
  const v = texto.safeParse(conteudo);
  if (!v.success || !uuid.safeParse(inquilinoId).success)
    return { ok: false, erro: "texto_obrigatorio" };
  const bd = await criarClienteServidor();
  const linha = (await listarVencimentos(bd)).find((l) => l.inquilinoId === inquilinoId);
  if (!linha) return { ok: false, erro: "sem_vencimento" };
  const p = await prepararLembrete(bd, inquilinoId, "email", v.data);
  if ("erro" in p) return { ok: false, erro: p.erro };
  const enviado = await enviarEmail(() =>
    emailLembreteVencimento({
      para: linha.email!,
      barbearia: linha.nome,
      vencimento: dataCurta(`${linha.vencimento}T12:00:00Z`),
      texto: v.data,
    }),
  );
  const erro = await registarEmailLembrete(bd, p.id, enviado);
  revalidar();
  return erro ? { ok: false, erro } : { ok: true, enviado };
}

/** Um e-mail que falhou pode tentar-se outra vez, com o mesmo texto. */
export async function reenviarEmail(id: string): Promise<Resultado<{ enviado: boolean }>> {
  await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const l = await lembreteParaReenviar(bd, id);
  const destino = l?.inquilinos;
  if (!l || l.canal !== "email" || l.estado !== "falhou" || !destino?.email)
    return { ok: false, erro: "estado_invalido" };
  const enviado = await enviarEmail(() =>
    emailLembreteVencimento({
      para: destino.email!,
      barbearia: destino.nome,
      vencimento: dataCurta(`${l.vencimento}T12:00:00Z`),
      texto: l.conteudo,
    }),
  );
  const erro = await registarEmailLembrete(bd, id, enviado);
  revalidar();
  return erro ? { ok: false, erro } : { ok: true, enviado };
}
