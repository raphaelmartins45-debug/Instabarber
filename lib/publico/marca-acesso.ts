import "server-only";
import type { MarcaAcesso } from "@/components/nucleo/cartao-acesso";
import { obterBarbeariaDoEndereco } from "./barbearia";

/** A marca da barbearia para os ecrãs de entrada no endereço dela (capa, logótipo, nome). */
export async function marcaAcesso(slug: string | null): Promise<MarcaAcesso | undefined> {
  if (!slug) return undefined;
  const b = await obterBarbeariaDoEndereco(slug);
  if (!b?.nome) return undefined;
  return {
    nome: b.nome,
    cidade: b.cidade,
    logoUrl: b.logo_url,
    capaUrl: b.capa_foto_url,
    capaCor: b.capa_cor,
  };
}
