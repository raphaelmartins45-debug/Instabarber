import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";

const t = textos.paineis.publico;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const barbearia = await obterBarbeariaDoEndereco((await params).slug);
  return { title: barbearia?.nome ?? t.naoEncontrada };
}

/**
 * Página pública (E.6). Nesta fase só a capa com o nome e «a entrada das três pessoas»;
 * serviços, marcação e o resto chegam na Fase 5.
 */
export default async function PaginaBarbearia({ params }: { params: Promise<{ slug: string }> }) {
  const barbearia = await obterBarbeariaDoEndereco((await params).slug);
  if (!barbearia) notFound();
  const { base } = await lerEndereco();
  // No endereço da barbearia a equipa entra em /app/entrar; no domínio principal, em /entrar.
  const entradaEquipa = base ? "/entrar" : "/app/entrar";
  return (
    <main className="min-h-dvh">
      <header
        className="px-4 py-16 text-center"
        style={{ background: barbearia.capa_cor ?? undefined }}
      >
        <h1 className="text-3xl font-bold text-primary">{barbearia.nome}</h1>
        {barbearia.cidade ? <p className="mt-1 text-primary/80">{barbearia.cidade}</p> : null}
      </header>
      <section aria-label={t.entrar} className="mx-auto grid max-w-sm gap-3 px-4 py-8">
        <Button asChild size="lg" className="h-12">
          <Link href={`${base}/entrar`}>{t.souCliente}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link href={entradaEquipa}>{t.souGestor}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link href={entradaEquipa}>{t.souBarbeiro}</Link>
        </Button>
      </section>
      <footer className="pb-6 text-center text-xs text-muted-foreground">{t.rodape}</footer>
    </main>
  );
}
