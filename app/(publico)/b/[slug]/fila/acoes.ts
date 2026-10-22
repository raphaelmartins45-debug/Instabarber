"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { ipDoPedido, lerEndereco } from "@/lib/inquilino/endereco";
import { criarAcessoDireto } from "@/lib/publico/acesso-direto";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { COOKIE_FILA } from "@/lib/publico/fila";
import {
  clienteDaEntrada,
  entrarFilaEspera,
  entrarFilaPresencial,
} from "@/lib/repositorios/filas-publicas";
import { consumirLimite, LIMITES_MARCACAO } from "@/lib/repositorios/limites";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaContactoPublico, esquemaEntradaPresencial } from "@/lib/validacao/marcacao";

// Filas do lado do cliente (F.4.1, F.4.3): a base de dados decide; aqui valida-se e conta-se.

const uuid = z.string().uuid();
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

async function dentroDoLimite() {
  return consumirLimite(
    criarClienteServico(),
    `entrada:ip:${await ipDoPedido()}`,
    LIMITES_MARCACAO.entradaIp,
  );
}

export type ResultadoFilaEspera = { ok: true; posicao: number } | { ok: false; erro: string };

/** Entra na fila de espera de um serviço e dia, quando o dia não tem vagas (F.4.1). */
export async function entrarNaFilaEspera(
  slug: string,
  servicoId: string,
  diaIso: string,
  dados: z.input<typeof esquemaContactoPublico>,
): Promise<ResultadoFilaEspera> {
  const b = await obterBarbeariaDoEndereco(slug);
  const v = esquemaContactoPublico.safeParse(dados);
  if (!b?.id || !uuid.safeParse(servicoId).success || !dia.safeParse(diaIso).success)
    return { ok: false, erro: "erro" };
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  if (!(await dentroDoLimite())) return { ok: false, erro: "limite" };
  const r = await entrarFilaEspera(await criarClienteServidor(), {
    inquilinoId: b.id,
    servicoId,
    dia: diaIso,
    ...v.data,
  });
  return r.ok ? r : { ok: false, erro: r.motivo };
}

export type ResultadoFilaPresencial =
  | { ok: true; acesso: "criado" | "codigo" | null }
  | { ok: false; erro: string };

/** Entra na fila presencial de hoje (F.4.3). A entrada fica num cookie para ver a posição. */
export async function entrarNaFilaPresencial(
  slug: string,
  dados: z.input<typeof esquemaEntradaPresencial>,
): Promise<ResultadoFilaPresencial> {
  const b = await obterBarbeariaDoEndereco(slug);
  const v = esquemaEntradaPresencial.safeParse(dados);
  if (!b?.id) return { ok: false, erro: "erro" };
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  if (!(await dentroDoLimite())) return { ok: false, erro: "limite" };
  const d = v.data;
  const bd = await criarClienteServidor();
  const r = await entrarFilaPresencial(bd, { inquilinoId: b.id, ...d });
  if (!r.ok) return { ok: false, erro: r.motivo };
  const { base } = await lerEndereco();
  (await cookies()).set(COOKIE_FILA, r.entradaId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `${base}/fila`,
    maxAge: 60 * 60 * 14,
  });
  if (!d.palavraPasse) return { ok: true, acesso: null };
  const servico = criarClienteServico();
  const acesso = await criarAcessoDireto(bd, servico, {
    inquilinoId: b.id,
    telefone: d.telefone,
    palavraPasse: d.palavraPasse,
    cliente: await clienteDaEntrada(servico, r.entradaId),
  });
  return { ok: true, acesso };
}
