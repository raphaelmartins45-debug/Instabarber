import type { Metadata } from "next";
import type { ReactNode } from "react";
import { obterContextoEquipa } from "@/lib/equipa/contexto";
import { enderecoIcone } from "@/lib/inquilino/icones";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Os painéis da barbearia levam o ícone e o manifesto dela (atalho no ecrã do telemóvel). */
export async function generateMetadata(): Promise<Metadata> {
  const { barbearia } = await obterContextoEquipa();
  const b = await obterConfiguracao(await criarClienteServidor(), barbearia.id);
  return {
    icons: {
      icon: [{ url: enderecoIcone(b.slug, 32, b.logo_url), sizes: "32x32", type: "image/png" }],
      apple: [{ url: enderecoIcone(b.slug, 180, b.logo_url) }],
    },
    manifest: `/api/manifesto/${b.slug}?inicio=/app`,
    appleWebApp: { title: b.nome },
  };
}

export default function LayoutPainel({ children }: { children: ReactNode }) {
  return children;
}
