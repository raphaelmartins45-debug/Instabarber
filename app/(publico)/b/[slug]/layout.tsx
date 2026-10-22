import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BarbeariaIndisponivel } from "@/components/publico/barbearia-indisponivel";
import { barbeariaSuspensa, obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";

// Camada 4: rota interna. O público chega pelo subdomínio, pelo domínio próprio ou por
// /<slug>; nunca vê «/b/» (L.4). Slug inexistente: não encontrada. Barbearia suspensa: um aviso
// neutro, sem a razão nem dados (M.4).

export default async function LayoutBarbearia({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (await obterBarbeariaDoEndereco(slug)) return children;
  if (await barbeariaSuspensa(slug)) return <BarbeariaIndisponivel />;
  notFound();
}
