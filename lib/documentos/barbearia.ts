import "server-only";
import { variavelOpcional } from "@/lib/configuracao/ambiente";
import { type Assinatura, assinaturaApoio, assinaturaComercial } from "./assinatura";
import { DOMINIO } from "@/lib/email/enderecos";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import { enderecosDaBarbearia, type EnderecosBarbearia } from "@/lib/inquilino/encaminhar";
import { obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { listarProprietarios, perfilDePlataforma } from "@/lib/repositorios/perfis";
import type { ClienteBD } from "@/lib/supabase/tipos";

// Os dados de uma barbearia para os documentos personalizados (D-181): nome, logótipo, cor,
// endereços (domínio próprio ou subdomínio) e o proprietário a quem se envia.

export type BarbeariaDoDocumento = {
  id: string;
  nome: string;
  slug: string;
  cidade: string | null;
  /** O e-mail da ficha da barbearia (contacto), que pode ser diferente do da conta do dono. */
  email: string | null;
  responsavel: string;
  cor: string | null;
  logoUrl: string | null;
  enderecos: EnderecosBarbearia;
  dono: { nome: string | null; email: string | null } | null;
};

export async function barbeariaDoDocumento(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<BarbeariaDoDocumento | null> {
  const b = await obterBarbearia(bd, inquilinoId);
  if (!b) return null;
  const [dono] = await listarProprietarios(bd, inquilinoId);
  return {
    id: b.id,
    nome: b.nome,
    slug: b.slug,
    cidade: b.cidade,
    email: b.email,
    responsavel: b.responsavel || dono?.nome || b.nome,
    cor: b.capa_cor,
    logoUrl: b.logo_url,
    enderecos: enderecosDaBarbearia({
      slug: b.slug,
      dominioProprio: b.dominio_proprio,
      raiz: process.env.ROOT_DOMAIN || "instabarber.pt",
      origem: await origemDoPedido(),
    }),
    dono: dono ? { nome: dono.nome, email: dono.email } : null,
  };
}

/**
 * A assinatura comercial de quem gera o documento (D-184): o nome, o cargo, o telefone e o
 * e-mail do registo, na Equipa InstaBarber; o que faltar vem da equipa comercial.
 */
export async function assinaturaDe(bd: ClienteBD, userId: string): Promise<Assinatura> {
  return assinaturaComercial(await perfilDePlataforma(bd, userId), {
    telefone: variavelOpcional("TELEFONE_COMERCIAL_TXT") ?? null,
    email: `comercial@${DOMINIO}`,
  });
}

/** A assinatura dos manuais (D-184): «Apoio ao cliente», com o WhatsApp do apoio e apoio@. */
export function assinaturaDoApoio(): Assinatura {
  return assinaturaApoio(
    variavelOpcional("TELEFONE_APOIO_TXT") ?? variavelOpcional("TELEFONE_COMERCIAL_TXT") ?? null,
  );
}
