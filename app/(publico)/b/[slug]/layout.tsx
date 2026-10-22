import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";

// Camada 4: rota interna. O público chega pelo subdomínio, pelo domínio próprio ou por
// /<slug>; nunca vê «/b/» (L.4). Slug inexistente ou barbearia não ativa: não encontrada.

export default async function LayoutBarbearia({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await obterBarbeariaDoEndereco(slug))) notFound();
  return children;
}
