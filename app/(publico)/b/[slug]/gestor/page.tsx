import { notFound } from "next/navigation";
import { EntradaEquipaBarbearia } from "@/components/nucleo/entrada-equipa-barbearia";
import { textos } from "@/lib/i18n/pt-PT";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";

export const metadata = {
  title: textos.acesso.equipa.gestorTitulo,
  robots: { index: false, follow: false },
};

/** Entrada do gestor no endereço da barbearia: <slug>.instabarber.pt/gestor (D-180). */
export default async function EntrarGestor({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seguinte?: string; erro?: string }>;
}) {
  const { slug } = await params;
  if (!(await obterBarbeariaDoEndereco(slug))) notFound();
  const { seguinte, erro } = await searchParams;
  return <EntradaEquipaBarbearia slug={slug} papel="gestor" seguinte={seguinte} erro={erro} />;
}
