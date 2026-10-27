import "server-only";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import { enderecosDaBarbearia, type EnderecosBarbearia } from "@/lib/inquilino/encaminhar";
import { obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { listarProprietarios, perfilDePlataforma } from "@/lib/repositorios/perfis";
import { textos } from "@/lib/i18n/pt-PT";
import type { ClienteBD } from "@/lib/supabase/tipos";

// Os dados de uma barbearia para os documentos personalizados (D-181): nome, logótipo, cor,
// endereços (domínio próprio ou subdomínio) e o proprietário a quem se envia.

export type BarbeariaDoDocumento = {
  id: string;
  nome: string;
  slug: string;
  cidade: string | null;
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
 * Quem assina os documentos (D-181): o nome do registo de quem os gera, na Equipa InstaBarber
 * (o dono, o gestor ou o comercial). Sem nome, fica a marca.
 */
export async function assinaturaDe(
  bd: ClienteBD,
  userId: string,
): Promise<{ nome: string; funcao: string; email: string | null }> {
  const p = await perfilDePlataforma(bd, userId);
  const funcoes = textos.documentos.funcoes;
  return {
    nome: p?.nome || textos.marca.nome,
    funcao: funcoes[p?.papel ?? ""] ?? textos.marca.nome,
    email: p?.email ?? null,
  };
}
