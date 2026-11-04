"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contasDemonstracao } from "@/lib/admin/contas-demonstracao";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { ESTILOS } from "@/lib/publico/estilos";
import { obterDemonstracao, prepararDemonstracao } from "@/lib/repositorios/admin/demonstracao";
import { carregarImagemPublica } from "@/lib/repositorios/painel/imagens";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// A demonstração para os comerciais (D-207): «Gerar» refaz a barbearia de demonstração com os
// dados desta reunião; «Reset» repõe a de origem. Toda a equipa da InstaBarber pode usar.

export type Resultado = { ok: true } | { ok: false; erro: string };

const esquema = z.object({
  nome: z.string().trim().min(2, "nome").max(60, "nome"),
  plano: z.enum(["basic", "pro"]),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "cor"),
  cidade: z.string().trim().max(60),
  whatsapp: z.string().trim().max(20),
  estilo: z.enum(ESTILOS),
});

function revalidar() {
  revalidatePath("/admin/vendas/demonstracao");
  revalidatePath("/demo");
}

export async function gerarDemonstracao(formulario: FormData): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const v = esquema.safeParse(Object.fromEntries(formulario));
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const whatsapp = v.data.whatsapp ? telefoneE164(v.data.whatsapp) : null;
  if (v.data.whatsapp && !whatsapp) return { ok: false, erro: "whatsapp" };
  const bd = await criarClienteServidor();
  const ficheiro = formulario.get("logo");
  let logo = (await obterDemonstracao(bd))?.logo_url ?? null;
  if (ficheiro instanceof File && ficheiro.size > 0) {
    logo = await carregarImagemPublica(bd, "demonstracao", ficheiro);
    if (!logo) return { ok: false, erro: "logo" };
  }
  const contas = await contasDemonstracao();
  const id = await prepararDemonstracao(bd, {
    plano: v.data.plano,
    gestor: contas?.gestor ?? null,
    barbeiro: contas?.barbeiro ?? null,
    nome: v.data.nome,
    logo,
    cor: v.data.cor.toUpperCase(),
    cidade: v.data.cidade || null,
    whatsapp,
    estilo: v.data.estilo,
  });
  revalidar();
  return id ? { ok: true } : { ok: false, erro: "erro" };
}

export async function reporDemonstracao(): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const contas = await contasDemonstracao();
  const id = await prepararDemonstracao(await criarClienteServidor(), {
    plano: "pro",
    gestor: contas?.gestor ?? null,
    barbeiro: contas?.barbeiro ?? null,
    nome: null,
    logo: null,
    cor: null,
    cidade: null,
    whatsapp: null,
    estilo: "anuario",
  });
  revalidar();
  return id ? { ok: true } : { ok: false, erro: "erro" };
}
