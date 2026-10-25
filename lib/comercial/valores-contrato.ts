import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Marcador } from "./contrato";
import type { esquemaContratante } from "./contrato";
import type { z } from "zod";

// Valores dos marcadores do contrato (N.8) a partir da proposta aceite, do contratante e dos
// dados mínimos da Prestadora (variáveis PRESTADORA_*, nunca o texto do modelo nem o repositório).

const t = textos.comercial;

export type Prestadora = {
  nome: string;
  nif: string;
  morada: string;
  qualidade: string;
  assinante: string;
};

export type PropostaAceite = {
  numero: string;
  plano: string;
  periodicidade: string;
  profissionais: number;
  dominio_proprio: boolean;
  desafio_90: boolean;
  valor_periodo_sem_iva: string;
  valor_periodo_com_iva: string;
  iva_taxa: number;
  condicoes_lancamento: string | null;
};

const dataPt = (iso: string) => iso.split("-").reverse().join("/");

export function valoresDoContrato(
  p: PropostaAceite,
  c: z.output<typeof esquemaContratante>,
  prestadora: Prestadora,
): Partial<Record<Marcador, string>> {
  const sem = centimosDeNumeric(p.valor_periodo_sem_iva);
  const com = centimosDeNumeric(p.valor_periodo_com_iva);
  return {
    "contratante.razao_social": c.razao_social,
    "contratante.nif": c.nif,
    "contratante.morada": c.morada,
    "contratante.representante": c.representante,
    "contratante.cargo": c.cargo,
    "contratante.email": c.email,
    "proposta.numero": p.numero,
    plano: t.briefing.planos[p.plano] ?? p.plano,
    profissionais: String(p.profissionais),
    periodicidade: t.briefing.periodicidades[p.periodicidade] ?? p.periodicidade,
    valor_sem_iva: formatarDinheiro(sem),
    valor_com_iva: formatarDinheiro(com),
    iva_texto: p.iva_taxa === 0 ? t.pdf.isento : t.pdf.ivaIncluido(formatarDinheiro(com - sem)),
    dominio_proprio: p.dominio_proprio ? t.contratos.dominioIncluido : "",
    data_inicio: dataPt(c.data_inicio),
    "prestadora.nome": prestadora.nome,
    "prestadora.nif": prestadora.nif,
    "prestadora.morada": prestadora.morada,
    "prestadora.qualidade": prestadora.qualidade,
    "prestadora.assinante": prestadora.assinante,
    condicoes_lancamento: p.condicoes_lancamento ?? "",
    desafio: p.desafio_90 ? t.contratos.desafioIncluido : "",
  };
}
