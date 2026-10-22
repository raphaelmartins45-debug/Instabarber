"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import { instanteLocal } from "@/lib/formatacao/datas";
import { MAXIMO_GALERIA_COM_CAPA, verificarImagem } from "@/lib/regras/imagens";
import { alterarConfiguracao, obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { carregarImagemPublica, removerImagemPublica } from "@/lib/repositorios/painel/imagens";
import {
  alternarPeriodo,
  criarAusencia,
  criarFeriado,
  criarPeriodo,
  removerAusencia,
  removerFeriado,
  removerPeriodo,
} from "@/lib/repositorios/painel/calendario";
import { gravarServico } from "@/lib/repositorios/painel/servicos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { EsquemaFormulario, ResultadoFicha } from "@/lib/validacao/formularios";
import {
  ESQUEMAS_SISTEMA,
  esquemaAusencia,
  esquemaFeriado,
  esquemaPeriodo,
  esquemaServico,
  type SeccaoComFormulario,
} from "@/lib/validacao/sistema";

// Secções da Gestão do sistema que gravam campos da barbearia (E.2). Só o gestor; os campos do
// plano estão protegidos na base de dados (proteger_inquilino).

export async function guardarSeccao(
  esquema: EsquemaFormulario,
  dados: Record<string, unknown>,
): Promise<ResultadoFicha> {
  const contexto = await exigirGestorParaEscrever();
  const e = ESQUEMAS_SISTEMA[esquema as SeccaoComFormulario];
  if (!e) return { ok: false, erro: "obrigatorio" };
  const v = e.safeParse(dados);
  if (!v.success) {
    const problema = v.error.issues[0];
    return { ok: false, erro: problema?.message ?? "obrigatorio", campo: problema?.path.join(".") };
  }
  const r = await alterarConfiguracao(await criarClienteServidor(), contexto.barbearia.id, v.data);
  revalidatePath("/app", "layout");
  return r.ok ? { ok: true } : { ok: false, erro: "numero" };
}

export type Resultado = { ok: true } | { ok: false; erro: string };

const uuid = z.string().uuid();

function revalidar() {
  revalidatePath("/app", "layout");
}

/** Ausência de um barbeiro ou da barbearia inteira (datas e horas locais de Lisboa). */
export async function novaAusencia(dados: z.input<typeof esquemaAusencia>): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaAusencia.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const instante = (s: string) => instanteLocal(s.slice(0, 10), s.slice(11, 16)).toISOString();
  const ok = await criarAusencia(await criarClienteServidor(), {
    inquilinoId: contexto.barbearia.id,
    profissionalId: v.data.profissionalId,
    inicio: instante(v.data.inicio),
    fim: instante(v.data.fim),
    tipo: v.data.tipo,
    motivo: v.data.motivo,
    criadoPor: contexto.userId,
  });
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function apagarAusencia(id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await removerAusencia(await criarClienteServidor(), contexto.barbearia.id, id);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function novoFeriado(dados: z.input<typeof esquemaFeriado>): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaFeriado.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const ok = await criarFeriado(
    await criarClienteServidor(),
    contexto.barbearia.id,
    v.data.data,
    v.data.nome,
  );
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "data" };
}

export async function apagarFeriado(id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await removerFeriado(await criarClienteServidor(), contexto.barbearia.id, id);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function novoPeriodo(dados: z.input<typeof esquemaPeriodo>): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaPeriodo.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const ok = await criarPeriodo(await criarClienteServidor(), contexto.barbearia.id, v.data);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function mudarPeriodo(id: string, ativo: boolean): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await alternarPeriodo(
    await criarClienteServidor(),
    contexto.barbearia.id,
    id,
    !!ativo,
  );
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function apagarPeriodo(id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await removerPeriodo(await criarClienteServidor(), contexto.barbearia.id, id);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

/** Serviço novo ou alterado (nome, descrição, duração, preço final; inglês e francês opcionais). */
export async function guardarServico(
  id: string | null,
  dados: z.input<typeof esquemaServico>,
): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaServico.safeParse(dados);
  if ((id !== null && !uuid.safeParse(id).success) || !v.success)
    return { ok: false, erro: v.error?.issues[0]?.message ?? "erro" };
  const ok = await gravarServico(await criarClienteServidor(), contexto.barbearia.id, id, v.data);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

const CAMPO_IMAGEM = z.enum(["logo", "capa", "galeria"]);

/** Logótipo, fachada ou fotografia da galeria (D.8.1), no bucket público da barbearia. */
export async function carregarImagemMarca(formulario: FormData): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const tipo = CAMPO_IMAGEM.safeParse(formulario.get("tipo"));
  const ficheiro = formulario.get("imagem");
  if (!tipo.success || !(ficheiro instanceof File) || ficheiro.size === 0)
    return { ok: false, erro: "imagem" };
  if (verificarImagem(tipo.data, { formato: ficheiro.type, tamanho: ficheiro.size }))
    return { ok: false, erro: "imagem" };
  const bd = await criarClienteServidor();
  const b = await obterConfiguracao(bd, contexto.barbearia.id);
  if (
    tipo.data === "galeria" &&
    b.galeria_urls.length + (b.capa_foto_url ? 1 : 0) >= MAXIMO_GALERIA_COM_CAPA
  )
    return { ok: false, erro: "imagem" };
  const url = await carregarImagemPublica(bd, contexto.barbearia.id, ficheiro);
  if (!url) return { ok: false, erro: "imagem" };
  const anterior =
    tipo.data === "logo" ? b.logo_url : tipo.data === "capa" ? b.capa_foto_url : null;
  const r = await alterarConfiguracao(
    bd,
    contexto.barbearia.id,
    tipo.data === "logo"
      ? { logo_url: url }
      : tipo.data === "capa"
        ? { capa_foto_url: url }
        : { galeria_urls: [...b.galeria_urls, url] },
  );
  if (!r.ok) {
    await removerImagemPublica(bd, url);
    return { ok: false, erro: "imagem" };
  }
  if (anterior) await removerImagemPublica(bd, anterior);
  revalidar();
  return { ok: true };
}

export async function removerImagemMarca(tipo: string, url: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const t = CAMPO_IMAGEM.safeParse(tipo);
  if (!t.success) return { ok: false, erro: "erro" };
  const bd = await criarClienteServidor();
  const b = await obterConfiguracao(bd, contexto.barbearia.id);
  const r = await alterarConfiguracao(
    bd,
    contexto.barbearia.id,
    t.data === "logo"
      ? { logo_url: null }
      : t.data === "capa"
        ? { capa_foto_url: null }
        : { galeria_urls: b.galeria_urls.filter((u) => u !== url) },
  );
  if (r.ok) await removerImagemPublica(bd, url);
  revalidar();
  return r.ok ? { ok: true } : { ok: false, erro: "erro" };
}
