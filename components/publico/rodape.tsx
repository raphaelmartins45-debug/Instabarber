import Link from "next/link";
import type { Lingua, TextosPublicos } from "@/lib/i18n/publico";
import { SeletorLingua } from "./seletor-lingua";

/**
 * Rodapé da página pública (E.6, H.2): Privacidade, Termos, Livro de Reclamações eletrónico,
 * avaliar no Google, os três acessos e, com `multilinguagem`, o seletor PT · EN · FR.
 */
export function Rodape({
  t,
  lingua,
  multilinguagem,
  origemPrincipal,
  reclamacoes,
  avaliacao,
  entradas,
}: {
  t: TextosPublicos;
  lingua: Lingua;
  multilinguagem: boolean;
  origemPrincipal: string;
  reclamacoes: string | null;
  avaliacao: string | null;
  entradas: { cliente: string; equipa: string };
}) {
  const ligacao = "underline-offset-4 hover:underline";
  return (
    <footer className="border-t bg-card px-4 pt-8 pb-28 text-sm md:pb-10">
      <div className="mx-auto grid max-w-5xl gap-4">
        <nav aria-label={t.rodape.acessos} className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href={entradas.cliente} className={ligacao}>
            {t.entrar.cliente}
          </Link>
          <Link href={entradas.equipa} className={ligacao}>
            {t.entrar.gestor}
          </Link>
          <Link href={entradas.equipa} className={ligacao}>
            {t.entrar.barbeiro}
          </Link>
        </nav>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
          <a href={`${origemPrincipal}/privacidade`} className={ligacao}>
            {t.rodape.privacidade}
          </a>
          <a href={`${origemPrincipal}/termos`} className={ligacao}>
            {t.rodape.termos}
          </a>
          <a
            href={reclamacoes ?? "https://www.livroreclamacoes.pt"}
            target="_blank"
            rel="noopener noreferrer"
            className={ligacao}
            data-testid="livro-reclamacoes"
          >
            {t.rodape.reclamacoes}
          </a>
          {avaliacao ? (
            <a href={avaliacao} target="_blank" rel="noopener noreferrer" className={ligacao}>
              {t.rodape.avaliar}
            </a>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{t.rodape.precos}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {multilinguagem ? <SeletorLingua atual={lingua} rotulo={t.linguas} /> : <span />}
          <span className="text-xs text-muted-foreground">{t.rodape.com}</span>
        </div>
      </div>
    </footer>
  );
}
