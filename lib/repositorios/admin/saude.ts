import type { DadosSaude } from "@/lib/admin/saude";
import { hojeIso, somarDias } from "@/lib/formatacao/datas";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Dados da saúde e do arranque das barbearias (sugestões A e B, D-159). Só o super_admin os lê
// (RLS). Lê-se o mínimo para contar: nenhuma coluna com nomes ou contactos de clientes.
// Nota: lê as marcações todas de cada barbearia; quando houver muitas barbearias, passa a uma vista
// agregada na base de dados.

export type LinhaSaude = DadosSaude & { id: string; nome: string; slug: string };

const contar = <T extends { inquilino_id: string }>(
  linhas: T[],
  filtro: (l: T) => boolean = () => true,
) => {
  const m = new Map<string, number>();
  for (const l of linhas) if (filtro(l)) m.set(l.inquilino_id, (m.get(l.inquilino_id) ?? 0) + 1);
  return m;
};

export async function dadosDeSaude(bd: ClienteBD): Promise<LinhaSaude[]> {
  const hoje = hojeIso();
  const ha30 = somarDias(hoje, -30);
  const ha60 = somarDias(hoje, -60);
  const [inq, serv, prof, cli, marc] = await Promise.all([
    bd
      .from("inquilinos")
      .select("id, nome, slug, estado, estado_pagamento, aprovado_em, logo_url")
      .in("estado", ["ativo", "suspenso"])
      .eq("demonstracao", false),
    bd.from("servicos").select("inquilino_id, ativo"),
    bd.from("profissionais").select("inquilino_id, ativo, perfil_id"),
    bd.from("clientes").select("inquilino_id").is("anonimizado_em", null),
    bd.from("marcacoes").select("inquilino_id, inicio, origem, estado, concluida_em"),
  ]);
  for (const [nome, r] of [
    ["inquilinos", inq],
    ["servicos", serv],
    ["profissionais", prof],
    ["clientes", cli],
    ["marcacoes", marc],
  ] as const)
    if (r.error) falhaDeLeitura(nome, r.error);
  const marcacoes = (marc.data ?? []).filter(
    (m) => m.estado !== "cancelada" && m.estado !== "reservada",
  );
  const dia = (iso: string) => hojeIso(new Date(iso));
  const servicos = contar(serv.data ?? [], (s) => s.ativo);
  const ativos = contar(prof.data ?? [], (p) => p.ativo);
  const acessos = contar(prof.data ?? [], (p) => p.ativo && !!p.perfil_id);
  const clientes = contar(cli.data ?? []);
  const total = contar(marcacoes);
  const online = contar(marcacoes, (m) => m.origem === "online");
  const concluidas = contar(marcacoes, (m) => !!m.concluida_em);
  const ult30 = contar(marcacoes, (m) => dia(m.inicio) > ha30 && dia(m.inicio) <= hoje);
  const ant30 = contar(marcacoes, (m) => dia(m.inicio) > ha60 && dia(m.inicio) <= ha30);
  const ultima = new Map<string, string>();
  for (const m of marcacoes) {
    const d = dia(m.inicio);
    if (d <= hoje && d > (ultima.get(m.inquilino_id) ?? "")) ultima.set(m.inquilino_id, d);
  }
  return (inq.data ?? []).map((b) => ({
    id: b.id,
    nome: b.nome,
    slug: b.slug,
    estado: b.estado,
    estadoPagamento: b.estado_pagamento,
    aprovadaEm: b.aprovado_em ? dia(b.aprovado_em) : null,
    temLogotipo: !!b.logo_url,
    servicosAtivos: servicos.get(b.id) ?? 0,
    profissionaisAtivos: ativos.get(b.id) ?? 0,
    profissionaisComAcesso: acessos.get(b.id) ?? 0,
    clientes: clientes.get(b.id) ?? 0,
    marcacoesTotal: total.get(b.id) ?? 0,
    marcacoesOnline: online.get(b.id) ?? 0,
    concluidas: concluidas.get(b.id) ?? 0,
    marcacoes30: ult30.get(b.id) ?? 0,
    marcacoesAnteriores30: ant30.get(b.id) ?? 0,
    ultimaMarcacao: ultima.get(b.id) ?? null,
  }));
}

/** Leads com o estado, a origem e a barbearia ligada (métricas, sugestão E). */
export async function leadsParaMetricas(bd: ClienteBD) {
  const { data, error } = await bd.from("leads").select("estado, origem, inquilino_id");
  if (error) falhaDeLeitura("leads", error);
  return data.map((l) => ({ estado: l.estado, origem: l.origem, inquilinoId: l.inquilino_id }));
}
