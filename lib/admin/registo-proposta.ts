import { IMPLEMENTACOES } from "@/lib/comercial/condicoes";
import { centimosDeNumeric, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import type { DadosRegistoBarbearia } from "@/lib/validacao/registo-barbearia";

// Registo a partir de uma proposta (D-195): os dados que a proposta e o lead já têm passam para o
// formulário de registo pelo painel. O briefing é o guardado na proposta (a fotografia do que foi
// proposto); o que lá faltar vem do lead. Tudo continua editável antes de registar.

export type PropostaParaRegisto = {
  plano: string;
  periodicidade: string;
  profissionais: number;
  implementacao: string;
  taxa_migracao_sem_iva: number | string;
  campanha_id: string | null;
  dados: unknown;
};

export type LeadParaRegisto = {
  nome_contacto: string;
  nome_barbearia: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  morada: string | null;
};

type Briefing = Partial<
  Record<
    | "nome_comercial"
    | "nif"
    | "morada"
    | "cidade"
    | "decisor_nome"
    | "decisor_email"
    | "decisor_telemovel",
    unknown
  >
>;

const texto = (...valores: unknown[]) =>
  valores.map((v) => (typeof v === "string" ? v.trim() : "")).find(Boolean) ?? "";

function briefingDe(dados: unknown): Briefing {
  if (!dados || typeof dados !== "object") return {};
  const b = (dados as { briefing?: unknown }).briefing;
  return b && typeof b === "object" ? (b as Briefing) : {};
}

/** Os campos do registo preenchidos com a proposta e o lead (o resto fica como está). */
export function dadosDaProposta(
  p: PropostaParaRegisto,
  lead: LeadParaRegisto | null,
): Partial<DadosRegistoBarbearia> {
  const b = briefingDe(p.dados);
  const implementacao = (IMPLEMENTACOES as readonly string[]).includes(p.implementacao)
    ? (p.implementacao as DadosRegistoBarbearia["implementacao"])
    : "nenhuma";
  const nif = texto(b.nif);
  return {
    nome: texto(b.nome_comercial, lead?.nome_barbearia),
    responsavel: texto(b.decisor_nome, lead?.nome_contacto),
    email_acesso: texto(b.decisor_email, lead?.email).toLowerCase(),
    telefone: texto(b.decisor_telemovel, lead?.telefone),
    nif: /^\d{9}$/.test(nif) ? nif : "",
    cidade: texto(b.cidade, lead?.cidade),
    morada: texto(b.morada, lead?.morada),
    ...(p.plano === "basic" || p.plano === "pro" ? { plano: p.plano } : {}),
    ...(["mensal", "semestral", "anual"].includes(p.periodicidade)
      ? { periodicidade: p.periodicidade as DadosRegistoBarbearia["periodicidade"] }
      : {}),
    profissionais: p.profissionais,
    implementacao,
    valor_implementacao: textoDeCentimos(
      implementacao === "nenhuma" ? 0 : centimosDeNumeric(p.taxa_migracao_sem_iva),
    ),
    campanha_id: p.campanha_id ?? "",
  };
}
