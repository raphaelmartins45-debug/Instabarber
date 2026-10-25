import { LogotipoMarca } from "@/components/nucleo/logotipo-marca";
import Link from "next/link";
import type { DocumentoLegal } from "@/lib/i18n/pt-PT/legal/tipos";
import { textos } from "@/lib/i18n/pt-PT";

const LIGACOES = [
  { href: "/termos", rotulo: textos.legal.termos },
  { href: "/privacidade", rotulo: textos.legal.privacidade },
  { href: "/termos/subcontratacao", rotulo: textos.legal.subcontratacao },
];

/** Página de um documento legal (H.4): legível no telemóvel, com as ligações aos outros dois. */
export function PaginaDocumentoLegal({ documento }: { documento: DocumentoLegal }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card px-4 py-4">
        <Link href="/" className="mx-auto block max-w-3xl" aria-label={textos.marca.nome}>
          <LogotipoMarca className="h-8" />
        </Link>
      </header>
      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8 leading-relaxed">
        <div className="grid gap-1">
          <h1 className="text-2xl font-extrabold">{documento.titulo}</h1>
          <p className="text-sm text-muted-foreground">{documento.versao}</p>
        </div>
        {documento.introducao.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {documento.seccoes.map((s) => (
          <section key={s.titulo} className="grid gap-2">
            <h2 className="text-[15px] font-bold text-ligacao">{s.titulo}</h2>
            {s.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.lista ? (
              <ul className="list-disc space-y-1 pl-5">
                {s.lista.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        <nav
          aria-label={textos.legal.documentos}
          className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-4 text-sm"
        >
          {LIGACOES.map((l) => (
            <Link key={l.href} href={l.href} className="text-ligacao underline underline-offset-4">
              {l.rotulo}
            </Link>
          ))}
        </nav>
      </main>
      <footer className="bg-primary px-4 py-4 text-center text-xs text-destaque">
        {textos.marca.assinatura}
      </footer>
    </div>
  );
}
