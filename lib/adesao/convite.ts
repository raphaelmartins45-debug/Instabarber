import { z } from "zod";
import type { DadosPedidoAdesao } from "@/lib/validacao/adesao";

// Valores iniciais do formulário de adesão (D.8) e o que um convite do Comercial (N.7) lhes
// junta. O convite traz só identidade, contactos e contratação; o resto preenche-se como sempre.

export const VALORES_VAZIOS: DadosPedidoAdesao = {
  identidade: {
    nome: "",
    responsavel: "",
    nif: "",
    ano_abertura: "",
    descricao: "",
    logo_path: "",
    capa_path: "",
    galeria_paths: [],
  },
  contactos: {
    telefone: "",
    whatsapp: "",
    email: "",
    cidade: "",
    morada: "",
    hora_abertura: "09:00",
    hora_fecho: "19:30",
    dias_descanso: [0, 1],
  },
  servicos: {
    servicos: [{ nome: "", duracao_min: "30", preco: "" }],
    equipa: [],
    modelo_caixa: "A",
  },
  contratacao: {
    plano: "pro",
    periodicidade: "mensal",
    profissionais: 3,
    preferencia_pagamento: "mbway",
    email_acesso: "",
    observacoes: "",
    aceitou_termos: false as unknown as true,
  },
  website: "",
};

const campo = z.string().max(300).optional().catch(undefined);
const esquemaConvite = z
  .object({
    identidade: z.object({ nome: campo, responsavel: campo, nif: campo }).partial().default({}),
    contactos: z.object({ morada: campo, email: campo }).partial().default({}),
    contratacao: z
      .object({
        plano: z.enum(["basic", "pro"]).optional().catch(undefined),
        periodicidade: z.enum(["mensal", "anual"]).optional().catch(undefined),
        profissionais: z.number().int().min(1).max(99).optional().catch(undefined),
        email_acesso: campo,
      })
      .partial()
      .default({}),
  })
  .catch({ identidade: {}, contactos: {}, contratacao: {} });

/** Só os campos com valor do convite substituem os vazios; dados estranhos ignoram-se. */
const preenchidos = <T extends object>(o: T) =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== ""),
  ) as Partial<T>;

export function valoresComConvite(dados: unknown): DadosPedidoAdesao {
  const c = esquemaConvite.parse(dados ?? {});
  const v = VALORES_VAZIOS;
  return {
    ...v,
    identidade: { ...v.identidade, ...preenchidos(c.identidade) },
    contactos: { ...v.contactos, ...preenchidos(c.contactos) },
    contratacao: { ...v.contratacao, ...preenchidos(c.contratacao) },
  };
}
