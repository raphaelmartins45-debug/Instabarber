"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { contasParaGerar, CUSTOS_DE_PARTIDA } from "@/lib/financas/custos";
import { hojeIso, mesAnterior, mesAtual } from "@/lib/formatacao/datas";
import {
  apagarConta,
  apagarCusto,
  atualizarConta,
  atualizarCusto,
  criarConta,
  criarCustos,
  guardarMeta,
  inserirContasGeradas,
  listarContas,
  listarCustos,
  marcarContaPaga,
  terminarCusto,
} from "@/lib/repositorios/financas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  type DadosConta,
  type DadosCusto,
  type DadosMeta,
  esquemaConta,
  esquemaCusto,
  esquemaMeta,
} from "@/lib/validacao/financas";

// Custos e contas a pagar (O.4). Só o super_admin com dois fatores; o RLS confere outra vez.

type Resultado = { ok: true; n?: number } | { ok: false; erro: string };
const uuid = z.string().uuid();
const erroDe = (issues: { message: string }[]) => issues[0]?.message ?? "generico";

function revalidar() {
  revalidatePath("/admin/financas", "layout");
  revalidatePath("/admin");
}

async function correr(ok: () => Promise<boolean>): Promise<Resultado> {
  await exigirSuperAdmin();
  const r = await ok();
  revalidar();
  return r ? { ok: true } : { ok: false, erro: "generico" };
}

export async function guardarCusto(id: string | null, dados: DadosCusto): Promise<Resultado> {
  const v = esquemaCusto.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  return correr(async () => {
    const bd = await criarClienteServidor();
    return id ? atualizarCusto(bd, uuid.parse(id), v.data) : criarCustos(bd, [v.data]);
  });
}

export async function terminar(id: string) {
  return correr(async () => terminarCusto(await criarClienteServidor(), id, hojeIso()));
}

export async function apagarUmCusto(id: string) {
  return correr(async () => apagarCusto(await criarClienteServidor(), id));
}

/** Os custos de partida (L.6) entram com início hoje; o operador corrige-os pela fatura. */
export async function carregarCustosDePartida(): Promise<Resultado> {
  return correr(async () => {
    const bd = await criarClienteServidor();
    if ((await listarCustos(bd)).length) return false;
    const hoje = hojeIso();
    return criarCustos(
      bd,
      CUSTOS_DE_PARTIDA.map((c) => ({
        descricao: c.descricao,
        categoria: c.categoria,
        tipo: c.tipo,
        valor_sem_iva: c.valorSemIvaCent,
        periodicidade: c.periodicidade,
        data_inicio: hoje,
        data_fim: "",
        nota: "",
      })),
    );
  });
}

export async function guardarConta(id: string | null, dados: DadosConta): Promise<Resultado> {
  const v = esquemaConta.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  return correr(async () => {
    const bd = await criarClienteServidor();
    return id ? atualizarConta(bd, uuid.parse(id), v.data) : criarConta(bd, v.data);
  });
}

export async function pagar(id: string) {
  return correr(async () => marcarContaPaga(await criarClienteServidor(), id, hojeIso()));
}

export async function apagarUmaConta(id: string) {
  return correr(async () => apagarConta(await criarClienteServidor(), id));
}

/** À mão, uma vez por mês (sem tarefas agendadas): as contas do próximo mês a partir dos custos. */
export async function gerarContasDoProximoMes(): Promise<Resultado> {
  await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const proximo = mesAnterior(mesAtual(), -1);
  const [custos, contas] = await Promise.all([listarCustos(bd), listarContas(bd)]);
  const novas = contasParaGerar(custos, proximo, contas);
  const ok = await inserirContasGeradas(bd, novas);
  revalidar();
  return ok ? { ok: true, n: novas.length } : { ok: false, erro: "generico" };
}

export async function guardarMetaDoMes(dados: DadosMeta): Promise<Resultado> {
  const v = esquemaMeta.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  return correr(async () =>
    guardarMeta(await criarClienteServidor(), {
      mes: `${v.data.mes}-01`,
      valorCent: v.data.valor_sem_iva,
      base: v.data.base,
    }),
  );
}
