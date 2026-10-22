"use server";

import { z } from "zod";
import { emailConfirmacao } from "@/lib/email/confirmacao-marcacao";
import { enviarEmail } from "@/lib/email/enviar";
import { ipDoPedido, paginaPublica } from "@/lib/inquilino/endereco";
import { criarAcessoDireto } from "@/lib/publico/acesso-direto";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { linguaPublica } from "@/lib/publico/lingua";
import {
  reclamarEmailConfirmacao,
  registarEmailConfirmacao,
} from "@/lib/repositorios/email-confirmacao";
import { consumirLimite, LIMITES_MARCACAO } from "@/lib/repositorios/limites";
import {
  clienteParaAcessoDireto,
  confirmarReserva,
  reservarVaga,
  vagasPublicas,
  type Reserva,
  type VagaPublica,
} from "@/lib/repositorios/marcacao-publica";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { esquemaDadosMarcacao } from "@/lib/validacao/marcacao";

// Marcação pública (E.4, F.7): a página só mostra; a base de dados decide.

const uuid = z.string().uuid();
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

async function barbearia(slug: string) {
  const b = await obterBarbeariaDoEndereco(slug);
  if (!b?.id || !b.aberto) return null;
  return b;
}

/** As vagas de um dia. Em «Sem preferência», uma por hora (fica com quem estiver livre). */
export async function vagasDoDia(
  slug: string,
  servicoId: string,
  diaIso: string,
  profissionalId: string | null,
): Promise<VagaPublica[]> {
  const b = await barbearia(slug);
  if (!b?.id || !uuid.safeParse(servicoId).success || !dia.safeParse(diaIso).success) return [];
  if (profissionalId !== null && !uuid.safeParse(profissionalId).success) return [];
  const vagas = await vagasPublicas(
    await criarClienteServidor(),
    b.id,
    servicoId,
    diaIso,
    profissionalId,
  );
  if (profissionalId) return vagas;
  const vistas = new Set<string>();
  return vagas.filter((v) => (vistas.has(v.inicio) ? false : (vistas.add(v.inicio), true)));
}

export async function reservar(
  slug: string,
  servicoId: string,
  inicio: string,
  profissionalId: string | null,
): Promise<{ ok: true; reserva: Reserva } | { ok: false; erro: string }> {
  const b = await obterBarbeariaDoEndereco(slug);
  if (!b?.id) return { ok: false, erro: "erro" };
  if (!b.aberto) return { ok: false, erro: "barbearia_fechada" };
  if (!uuid.safeParse(servicoId).success || Number.isNaN(Date.parse(inicio)))
    return { ok: false, erro: "erro" };
  if (profissionalId !== null && !uuid.safeParse(profissionalId).success)
    return { ok: false, erro: "erro" };
  if (
    !(await consumirLimite(
      criarClienteServico(),
      `reservar:ip:${await ipDoPedido()}`,
      LIMITES_MARCACAO.reservarIp,
    ))
  )
    return { ok: false, erro: "limite" };
  const r = await reservarVaga(await criarClienteServidor(), {
    inquilinoId: b.id,
    servicoId,
    inicio,
    profissionalId,
  });
  return r.ok ? r : { ok: false, erro: r.motivo };
}

export type ResultadoConfirmacao =
  | { ok: true; acesso: "criado" | "codigo" | null }
  | { ok: false; erro: string };

/**
 * Confirma a reserva com os dados do cliente. Com palavra-passe, cria o acesso logo se o número
 * for novo na barbearia (F.9, pode_criar_acesso_direto); senão, o acesso faz-se por código.
 */
export async function confirmar(
  slug: string,
  marcacaoId: string,
  token: string,
  dados: z.input<typeof esquemaDadosMarcacao>,
): Promise<ResultadoConfirmacao> {
  const b = await obterBarbeariaDoEndereco(slug);
  const v = esquemaDadosMarcacao.safeParse(dados);
  if (!b?.id || !uuid.safeParse(marcacaoId).success || !/^[0-9a-f]{64}$/.test(token))
    return { ok: false, erro: "erro" };
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const servico = criarClienteServico();
  if (
    !(await consumirLimite(
      servico,
      `confirmar:ip:${await ipDoPedido()}`,
      LIMITES_MARCACAO.confirmarIp,
    ))
  )
    return { ok: false, erro: "limite" };
  const d = v.data;
  const bd = await criarClienteServidor();
  const r = await confirmarReserva(bd, {
    marcacaoId,
    token,
    nome: d.nome,
    telefone: d.telefone,
    email: d.email,
    nascimento: d.nascimento,
    consentimento: d.consentimento,
    convite: d.convite,
  });
  if (!r.ok) return { ok: false, erro: r.motivo };
  await enviarConfirmacao(bd, b, marcacaoId);
  if (!d.palavraPasse) return { ok: true, acesso: null };

  const acesso = await criarAcessoDireto(bd, servico, {
    inquilinoId: b.id,
    telefone: d.telefone,
    palavraPasse: d.palavraPasse,
    cliente: await clienteParaAcessoDireto(servico, marcacaoId),
  });
  return { ok: true, acesso };
}

/** E-mail de confirmação (F.4.12), quando a barbearia o tem ligado e o cliente deu e-mail. */
async function enviarConfirmacao(
  bd: ClienteBD,
  b: { slug: string | null; multilinguagem_ativa: boolean | null },
  marcacaoId: string,
) {
  const dados = await reclamarEmailConfirmacao(bd, marcacaoId);
  if (!dados || !b.slug) return;
  const lingua = await linguaPublica(!!b.multilinguagem_ativa);
  const pagina = await paginaPublica(b.slug);
  const enviado = await enviarEmail(() => emailConfirmacao(dados, lingua, pagina));
  await registarEmailConfirmacao(bd, marcacaoId, enviado);
}
