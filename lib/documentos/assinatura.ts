import { formatarTelefone, telefoneE164 } from "@/lib/formatacao/telefone";
import { textos } from "@/lib/i18n/pt-PT";

// Quem assina os documentos (D-184). Duas assinaturas, sempre com o mesmo desenho: o nome a preto
// e negrito; por baixo, em cinzento-escuro, o cargo, o WhatsApp e o e-mail.
// · Propostas e folheto: a pessoa da Equipa InstaBarber que os gera, com o cargo («Gestor
//   comercial» para o dono e o gestor, «Comercial» para o comercial).
// · Manuais (guias): «Apoio ao cliente», com o WhatsApp e o e-mail do apoio.

export type Assinatura = {
  nome: string;
  cargo: string | null;
  telefone: string | null;
  email: string | null;
};

const t = textos.documentos.assinatura;

/** Telefone em E.164 (perfil) ou só em dígitos (variável de ambiente) → «912 345 678». */
export function telefoneParaMostrar(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const e164 = telefoneE164(valor.startsWith("+") ? valor : `+${valor.replace(/\D/g, "")}`);
  return e164 ? formatarTelefone(e164) : null;
}

/**
 * A assinatura comercial de quem gera o documento. Sem nome no registo, fica a marca
 * («Comercial InstaBarber», D-101) sem cargo; sem telefone ou e-mail, os da equipa comercial.
 */
export function assinaturaComercial(
  perfil: {
    nome: string | null;
    papel: string;
    telefone: string | null;
    email: string | null;
  } | null,
  recurso: { telefone: string | null; email: string },
): Assinatura {
  const nome = perfil?.nome?.trim();
  return {
    nome: nome || textos.marca.assinaturaComercial,
    cargo: nome ? (t.cargos[perfil!.papel] ?? null) : null,
    telefone: telefoneParaMostrar(perfil?.telefone) ?? telefoneParaMostrar(recurso.telefone),
    email: perfil?.email || recurso.email,
  };
}

/** A assinatura dos manuais: «Apoio ao cliente», o WhatsApp do apoio e apoio@. */
export function assinaturaApoio(telefone: string | null): Assinatura {
  return {
    nome: t.apoio,
    cargo: null,
    telefone: telefoneParaMostrar(telefone),
    email: textos.marca.apoio,
  };
}

/** As linhas por baixo do nome, pela ordem fixa: cargo, WhatsApp, e-mail. */
export const linhasDaAssinatura = (a: Assinatura): string[] =>
  [a.cargo, a.telefone, a.email].filter((l): l is string => !!l);
