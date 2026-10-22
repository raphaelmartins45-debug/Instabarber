import { NextResponse } from "next/server";
import { enderecoIcone } from "@/lib/inquilino/icones";
import { slugValido } from "@/lib/inquilino/host";
import { textos } from "@/lib/i18n/pt-PT";
import { obterBarbeariaPublica } from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Manifesto da barbearia: o atalho no ecrã do telemóvel leva o nome e o ícone dela.

export async function GET(pedido: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = slugValido(slug)
    ? await obterBarbeariaPublica(await criarClienteServidor(), slug)
    : null;
  const inicio = new URL(pedido.url).searchParams.get("inicio");
  const nome = b?.nome ?? textos.marca.nome;
  return NextResponse.json(
    {
      name: nome,
      short_name: nome.length > 12 ? nome.split(/\s+/).slice(-1)[0] : nome,
      lang: "pt-PT",
      start_url: inicio?.startsWith("/") ? inicio : "/",
      display: "standalone",
      background_color: "#12100E",
      theme_color: "#12100E",
      icons: [192, 512].map((t) => ({
        src: enderecoIcone(slug, t as 192 | 512, b?.logo_url ?? null),
        sizes: `${t}x${t}`,
        type: "image/png",
      })),
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
