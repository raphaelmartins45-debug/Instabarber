import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BarbeariaIndisponivel } from "@/components/publico/barbearia-indisponivel";
import { LinguaDocumento } from "@/components/publico/lingua-documento";
import { barbeariaSuspensa, obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { linguaPublica } from "@/lib/publico/lingua";

// Camada 4: rota interna. O público chega pelo subdomínio, pelo domínio próprio ou por
// /<slug>; nunca vê «/b/» (L.4). Slug inexistente: não encontrada. Barbearia suspensa: um aviso
// neutro, sem a razão nem dados (M.4). O documento fica na língua da página (D-178).

export default async function LayoutBarbearia({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = await obterBarbeariaDoEndereco(slug);
  if (b)
    return (
      <>
        <LinguaDocumento lingua={await linguaPublica(!!b.multilinguagem_ativa)} />
        {children}
      </>
    );
  if (await barbeariaSuspensa(slug)) return <BarbeariaIndisponivel />;
  notFound();
}
