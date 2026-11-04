import { CalendarClock, Globe, Scissors } from "lucide-react";
import { LogotipoMarca } from "@/components/nucleo/logotipo-marca";
import { textos } from "@/lib/i18n/pt-PT";
import { obterDemonstracao } from "@/lib/repositorios/admin/demonstracao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial.demonstracao;
export const metadata = { title: t.paginaTitulo, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * A entrada da demonstração (D-207): o logótipo da InstaBarber, as boas-vindas com o nome da
 * barbearia da reunião, três passos e as três vistas, cada uma numa janela nova.
 */
export default async function PaginaDemo({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const demo = await obterDemonstracao(await criarClienteServidor());
  const personalizada = demo && demo.nome !== "Barbearia Demonstração";
  const vistas = [
    { href: "/demo/gestor", titulo: t.vistaGestor, desc: t.descGestor, Icone: CalendarClock },
    { href: "/demo/barbeiro", titulo: t.vistaBarbeiro, desc: t.descBarbeiro, Icone: Scissors },
    { href: "/demo/publica", titulo: t.vistaPublica, desc: t.descPublica, Icone: Globe },
  ];
  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl content-center gap-10 px-4 py-12 md:px-8">
      <header className="grid justify-items-start gap-6">
        <LogotipoMarca className="h-10" priority />
        <div className="grid gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{t.bemVindo}</h1>
          <p className="flex flex-wrap items-center gap-3 text-lg text-muted-foreground">
            {personalizada && demo.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
              <img
                src={demo.logo_url}
                alt=""
                className="size-10 rounded-lg object-contain"
                style={{ backgroundColor: demo.capa_cor ?? undefined }}
              />
            ) : null}
            {personalizada ? t.saudacao(demo.nome) : t.saudacaoOrigem}
          </p>
        </div>
      </header>
      {erro ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          {erro === "sem-demo" ? t.semDemo : t.erroEntrada}
        </p>
      ) : null}
      <ol className="grid gap-3 md:grid-cols-3">
        {t.passos.map((passo, i) => (
          <li key={passo} className="flex gap-3 text-sm text-muted-foreground">
            <span className="numero grid size-7 shrink-0 place-items-center rounded-full bg-accent font-bold text-destaque">
              {i + 1}
            </span>
            {passo}
          </li>
        ))}
      </ol>
      <nav className="grid gap-4 md:grid-cols-3" aria-label={t.ligacoes}>
        {vistas.map(({ href, titulo, desc, Icone }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener"
            className="cartao group grid content-start gap-4 rounded-2xl p-6 transition-colors hover:border-destaque/60"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-accent text-destaque">
              <Icone aria-hidden className="size-6" />
            </span>
            <span className="grid gap-1">
              <span className="text-xl font-bold">{titulo}</span>
              <span className="text-sm text-muted-foreground">{desc}</span>
            </span>
            <span className="text-sm font-semibold text-destaque group-hover:underline">
              {t.abrir} →
            </span>
          </a>
        ))}
      </nav>
    </main>
  );
}
