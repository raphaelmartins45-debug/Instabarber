import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaPublica } from "@/components/publico/pagina-barbearia";
import { enderecoIcone } from "@/lib/inquilino/icones";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { listarServicosPublicos } from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { textos } from "@/lib/i18n/pt-PT";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const b = await obterBarbeariaDoEndereco((await params).slug);
  if (!b?.id || !b.slug) return { title: textos.paineis.publico.naoEncontrada };
  const servicos = await listarServicosPublicos(await criarClienteServidor(), b.id);
  const titulo = b.cidade ? `${b.nome} · ${b.cidade}` : (b.nome ?? "");
  return {
    title: titulo,
    description:
      b.descricao ??
      servicos
        .slice(0, 4)
        .map((s) => s.nome)
        .join(", "),
    icons: {
      icon: [{ url: enderecoIcone(b.slug, 32, b.logo_url), sizes: "32x32", type: "image/png" }],
      apple: [{ url: enderecoIcone(b.slug, 180, b.logo_url) }],
    },
    manifest: `/api/manifesto/${b.slug}`,
    appleWebApp: { title: b.nome ?? undefined },
  };
}

/** Página pública (E.6): a porta de entrada do cliente; a equipa entra por /gestor e /barbeiro (D-180). */
export default async function PaginaBarbearia({ params }: { params: Promise<{ slug: string }> }) {
  const b = await obterBarbeariaDoEndereco((await params).slug);
  if (!b?.id || !b.slug || !b.nome) notFound();
  return <PaginaPublica b={{ ...b, id: b.id, nome: b.nome }} />;
}
