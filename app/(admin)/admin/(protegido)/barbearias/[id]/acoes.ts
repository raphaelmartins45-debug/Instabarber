"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { COOKIE_APOIO, DURACAO_APOIO_MIN, lerApoio } from "@/lib/admin/apoio";
import { reenviarBoasVindas } from "@/lib/admin/aprovacao";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { apagarContas } from "@/lib/auth/contas";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { lerCsv, validarClientes, validarServicos } from "@/lib/regras/importacao";
import {
  alterarBarbearia,
  eliminarBarbearia,
  obterBarbearia,
} from "@/lib/repositorios/admin/barbearias";
import { registarAcaoAdmin } from "@/lib/repositorios/admin/auditoria";
import { importarClientes, telefonesExistentes } from "@/lib/repositorios/admin/clientes";
import { alterarServico, criarServicos } from "@/lib/repositorios/admin/servicos";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { ESQUEMAS_SEPARADOR, type SeparadorComFormulario } from "@/lib/validacao/ficha-barbearia";
import type { EsquemaFormulario, ResultadoFicha } from "@/lib/validacao/formularios";

// Ações da ficha da barbearia (E.1). Só o super_admin com dois fatores; o RLS volta a verificar.

const id = z.string().uuid();

const caminho = (inquilinoId: string) => `/admin/barbearias/${inquilinoId}`;

export async function guardarSeparador(
  inquilinoId: string,
  separador: EsquemaFormulario,
  dados: Record<string, unknown>,
): Promise<ResultadoFicha> {
  await exigirSuperAdmin();
  const esquema = ESQUEMAS_SEPARADOR[separador as SeparadorComFormulario];
  if (!esquema || !id.safeParse(inquilinoId).success) return { ok: false, erro: "obrigatorio" };
  const v = esquema.safeParse(dados);
  if (!v.success) {
    const problema = v.error.issues[0];
    return { ok: false, erro: problema?.message ?? "obrigatorio", campo: problema?.path.join(".") };
  }
  const r = await alterarBarbearia(await criarClienteServidor(), inquilinoId, v.data);
  if (!r.ok) {
    if (r.motivo.includes("limite_profissionais"))
      return { ok: false, erro: "limiteProfissionais", campo: "profissionais_contratados" };
    if (r.motivo.includes("23505") && r.motivo.includes("slug"))
      return { ok: false, erro: "slugRepetido", campo: "slug" };
    if (r.motivo.includes("23505") && r.motivo.includes("dominio"))
      return { ok: false, erro: "dominioRepetido", campo: "dominio_proprio" };
    if (r.motivo.includes("slug")) return { ok: false, erro: "slug", campo: "slug" };
    return { ok: false, erro: "numero" };
  }
  revalidatePath(caminho(inquilinoId), "layout");
  return { ok: true };
}

export async function mudarEstado(
  inquilinoId: string,
  estado: "ativo" | "suspenso" | "cancelado",
): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  if (!id.safeParse(inquilinoId).success || !["ativo", "suspenso", "cancelado"].includes(estado))
    return { ok: false };
  const r = await alterarBarbearia(await criarClienteServidor(), inquilinoId, { estado });
  revalidatePath(caminho(inquilinoId), "layout");
  return { ok: r.ok };
}

/** Eliminar definitivamente: só cancelada e com o slug como confirmação; apaga as contas sem uso. */
export async function eliminar(
  inquilinoId: string,
  confirmacao: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  await exigirSuperAdmin();
  if (!id.safeParse(inquilinoId).success) return { ok: false, erro: "slugErrado" };
  const r = await eliminarBarbearia(await criarClienteServidor(), inquilinoId, confirmacao.trim());
  if (!r.ok)
    return { ok: false, erro: r.motivo.includes("nao_cancelado") ? "soCancelada" : "slugErrado" };
  await apagarContas(criarClienteServico(), r.contas);
  revalidatePath("/admin/barbearias");
  return { ok: true };
}

/** Vista de apoio só de leitura: justificação, 30 minutos, auditoria (E.1). */
export async function iniciarApoio(
  inquilinoId: string,
  justificacao: string,
): Promise<{ ok: true } | { ok: false }> {
  await exigirSuperAdmin();
  const j = z.string().trim().min(10).max(500).safeParse(justificacao);
  if (!id.safeParse(inquilinoId).success || !j.success) return { ok: false };
  const bd = await criarClienteServidor();
  const expira = new Date(Date.now() + DURACAO_APOIO_MIN * 60_000).toISOString();
  await registarAcaoAdmin(bd, {
    inquilinoId,
    accao: "vista_apoio",
    entidade: "inquilinos",
    entidadeId: inquilinoId,
    detalhes: { justificacao: j.data, expira },
  });
  (await cookies()).set(COOKIE_APOIO, JSON.stringify({ inquilino: inquilinoId, expira }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_APOIO_MIN * 60,
  });
  return { ok: true };
}

export async function reenviarBoasVindasDono(inquilinoId: string): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  const b = id.safeParse(inquilinoId).success
    ? await obterBarbearia(await criarClienteServidor(), inquilinoId)
    : null;
  if (!b) return { ok: false };
  return { ok: await reenviarBoasVindas(inquilinoId, { nome: b.nome, slug: b.slug }) };
}

const esquemaServico = z.object({
  nome: z.string().trim().min(2).max(80),
  duracao_min: z.coerce.number().int().min(5).max(480),
  preco: z.string().transform((v, ctx) => {
    const c = centimosDeTexto(v);
    if (c === null) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "preco" });
    return c ?? 0;
  }),
});

export async function acrescentarServico(
  inquilinoId: string,
  dados: { nome: string; duracao_min: string; preco: string },
): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  const v = esquemaServico.safeParse(dados);
  if (!id.safeParse(inquilinoId).success || !v.success) return { ok: false };
  const ok = await criarServicos(await criarClienteServidor(), inquilinoId, [
    { nome: v.data.nome, duracao_min: v.data.duracao_min, preco_centimos: v.data.preco },
  ]);
  revalidatePath(`${caminho(inquilinoId)}/servicos`);
  return { ok };
}

export async function ativarServico(
  inquilinoId: string,
  servicoId: string,
  ativo: boolean,
): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  if (!id.safeParse(inquilinoId).success || !id.safeParse(servicoId).success) return { ok: false };
  const ok = await alterarServico(await criarClienteServidor(), inquilinoId, servicoId, { ativo });
  revalidatePath(`${caminho(inquilinoId)}/servicos`);
  return { ok };
}

/** Importação CSV (E.1): o servidor volta a validar o ficheiro inteiro e grava só as linhas válidas. */
export async function importar(
  inquilinoId: string,
  tipo: "clientes" | "servicos",
  csv: string,
): Promise<{ ok: true; gravadas: number } | { ok: false }> {
  await exigirSuperAdmin();
  if (!id.safeParse(inquilinoId).success || csv.length > 2_000_000) return { ok: false };
  const bd = await criarClienteServidor();
  const linhas = lerCsv(csv);
  let gravadas = 0;
  if (tipo === "clientes") {
    const { validas } = validarClientes(linhas, await telefonesExistentes(bd, inquilinoId));
    gravadas = await importarClientes(bd, inquilinoId, validas);
  } else {
    const { validas } = validarServicos(linhas);
    gravadas = (await criarServicos(bd, inquilinoId, validas)) ? validas.length : 0;
  }
  await registarAcaoAdmin(bd, {
    inquilinoId,
    accao: `importacao_${tipo}`,
    entidade: tipo,
    detalhes: { gravadas },
  });
  revalidatePath(caminho(inquilinoId), "layout");
  return { ok: true, gravadas };
}

/** Sai da vista de apoio e volta à ficha da barbearia. */
export async function terminarApoio(): Promise<{ destino: string }> {
  await exigirSuperAdmin();
  const loja = await cookies();
  const apoio = lerApoio(loja.get(COOKIE_APOIO)?.value);
  loja.delete(COOKIE_APOIO);
  if (!apoio) return { destino: "/admin/barbearias" };
  await registarAcaoAdmin(await criarClienteServidor(), {
    inquilinoId: apoio.inquilino,
    accao: "vista_apoio_fim",
    entidade: "inquilinos",
    entidadeId: apoio.inquilino,
  });
  return { destino: caminho(apoio.inquilino) };
}

/** Marca (E.1): grava o URL público de uma imagem já carregada para publico/<inquilino>/. */
export async function definirImagemMarca(
  inquilinoId: string,
  campo: "logo_url" | "capa_foto_url" | "galeria",
  caminhoImagem: string | null,
): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  if (!id.safeParse(inquilinoId).success) return { ok: false };
  if (
    caminhoImagem &&
    !new RegExp(`^${inquilinoId}/[a-z0-9-]+\\.(png|svg|webp|jpg)$`).test(caminhoImagem)
  )
    return { ok: false };
  const bd = await criarClienteServidor();
  const b = await obterBarbearia(bd, inquilinoId);
  if (!b) return { ok: false };
  const url = caminhoImagem
    ? bd.storage.from("publico").getPublicUrl(caminhoImagem).data.publicUrl
    : null;
  const campos =
    campo === "galeria"
      ? { galeria_urls: url ? [...b.galeria_urls, url].slice(0, 6) : [] }
      : { [campo]: url };
  const r = await alterarBarbearia(bd, inquilinoId, campos);
  revalidatePath(`${caminho(inquilinoId)}/marca`);
  return { ok: r.ok };
}
