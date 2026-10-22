import type { Grelha } from "@/lib/funcionalidades/servidor";

// As secções da Gestão do sistema (E.2): cada uma só aparece com a funcionalidade ativa.

export type Seccao = { id: string; chave: string | null };

export const SECCOES: readonly Seccao[] = [
  { id: "estado", chave: null },
  { id: "marca", chave: "pagina_publica" },
  { id: "horario", chave: "agenda_basica" },
  { id: "ausencias", chave: "agenda_basica" },
  { id: "equipa", chave: null },
  { id: "servicos", chave: null },
  { id: "fidelizacao", chave: "fidelizacao_selos" },
  { id: "aniversario", chave: "campanha_aniversario" },
  { id: "faltas", chave: "politica_faltas" },
  { id: "ligacoes", chave: null },
  { id: "clube", chave: "clube_assinatura" },
  { id: "loja", chave: "loja_produtos" },
  { id: "periodos", chave: "precos_dinamicos" },
  { id: "cartoes", chave: "cartoes_oferta" },
  { id: "orfas", chave: "agenda_basica" },
];

export function seccoesAtivas(grelha: Grelha): Seccao[] {
  return SECCOES.filter((s) => s.chave === null || grelha.ativas.has(s.chave));
}
