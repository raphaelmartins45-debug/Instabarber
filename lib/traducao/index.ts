import "server-only";
import { variavelOpcional } from "@/lib/configuracao/ambiente";
import { type LinguaDestino, traduzirDeepl } from "./deepl";

// Tradução automática dos serviços (D-176). Desligada até haver DEEPL_CHAVE na Vercel: sem ela, o
// botão não aparece e fica o «copiar do português» de sempre.

export const traducaoLigada = (): boolean => !!variavelOpcional("DEEPL_CHAVE");

export type ServicoTraduzido = Record<LinguaDestino, { nome: string; descricao: string }>;

/** O nome e a descrição em inglês e em francês; null se a tradução estiver desligada ou falhar. */
export async function traduzirServico(
  nome: string,
  descricao: string,
): Promise<ServicoTraduzido | null> {
  const chave = variavelOpcional("DEEPL_CHAVE");
  if (!chave) return null;
  const [en, fr] = await Promise.all([
    traduzirDeepl(chave, [nome, descricao], "en"),
    traduzirDeepl(chave, [nome, descricao], "fr"),
  ]);
  if (!en || !fr) return null;
  return {
    en: { nome: en[0]!, descricao: en[1]! },
    fr: { nome: fr[0]!, descricao: fr[1]! },
  };
}
