import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// A barbearia de demonstração (D-162, D-207): refeita para hoje pela função
// preparar_demonstracao(), personalizada para cada reunião (toda a equipa da InstaBarber).

export type OpcoesDemonstracao = {
  plano: "basic" | "pro";
  gestor: string | null;
  barbeiro: string | null;
  nome: string | null;
  logo: string | null;
  cor: string | null;
  cidade: string | null;
  whatsapp: string | null;
  estilo: string;
};

export async function prepararDemonstracao(
  bd: ClienteBD,
  o?: OpcoesDemonstracao,
): Promise<string | null> {
  const { data, error } = await bd.rpc(
    "preparar_demonstracao",
    o
      ? {
          p_plano: o.plano,
          p_gestor: o.gestor ?? undefined,
          p_barbeiro: o.barbeiro ?? undefined,
          p_nome: o.nome ?? undefined,
          p_logo: o.logo ?? undefined,
          p_cor: o.cor ?? undefined,
          p_cidade: o.cidade ?? undefined,
          p_whatsapp: o.whatsapp ?? undefined,
          p_estilo: o.estilo,
        }
      : {},
  );
  return error ? null : data;
}

export type Demonstracao = {
  id: string;
  slug: string;
  nome: string;
  logo_url: string | null;
  capa_cor: string | null;
  cidade: string | null;
  whatsapp: string | null;
  estilo_pagina: string;
};

/** A demonstração atual, pela vista pública (o comercial não lê a tabela das barbearias). */
export async function obterDemonstracao(bd: ClienteBD): Promise<Demonstracao | null> {
  const { data, error } = await bd
    .from("publico_inquilinos")
    .select("id, slug, nome, logo_url, capa_cor, cidade, whatsapp, estilo_pagina")
    .eq("slug", "demonstracao")
    .maybeSingle();
  if (error) falhaDeLeitura("publico_inquilinos", error);
  if (!data?.id || !data.slug || !data.nome) return null;
  return {
    id: data.id,
    slug: data.slug,
    nome: data.nome,
    logo_url: data.logo_url,
    capa_cor: data.capa_cor,
    cidade: data.cidade,
    whatsapp: data.whatsapp,
    estilo_pagina: data.estilo_pagina ?? "anuario",
  };
}
