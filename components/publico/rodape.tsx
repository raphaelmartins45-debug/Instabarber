import Link from "next/link";
import type { Lingua, TextosPublicos } from "@/lib/i18n/publico";
import type { CoresCapa } from "@/lib/publico/cores-capa";
import { SeletorLingua } from "./seletor-lingua";

/**
 * Rodapé da página pública (E.6, H.2, D-200), nas cores do cabeçalho: o logótipo e o nome da
 * barbearia, a área de cliente, Privacidade, Termos, Livro de Reclamações eletrónico, avaliar no
 * Google e, com `multilinguagem`, o seletor PT · EN · FR.
 */
export function Rodape({
  t,
  lingua,
  multilinguagem,
  origemPrincipal,
  reclamacoes,
  avaliacao,
  entrar,
  nome,
  logo,
  cores,
}: {
  nome: string;
  logo: string | null;
  cores: CoresCapa;
  t: TextosPublicos;
  lingua: Lingua;
  multilinguagem: boolean;
  origemPrincipal: string;
  reclamacoes: string | null;
  avaliacao: string | null;
  entrar: string;
}) {
  const ligacao = "underline-offset-4 hover:underline";
  return (
    <footer
      className="mt-10 pb-24 text-sm md:mt-16 md:pb-0"
      style={{ backgroundColor: cores.fundo, color: cores.tinta }}
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:px-8">
        <div className="flex items-center gap-4">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
            <img src={logo} alt="" className="h-14 w-auto max-w-32 object-contain" />
          ) : null}
          <p className="titulo-estilo text-2xl" translate="no">
            {nome}
          </p>
        </div>
        <nav aria-label={t.rodape.acessos} className="grid gap-2 md:justify-items-end">
          <Link href={entrar} className={`${ligacao} font-semibold`}>
            {t.entrar.cliente}
          </Link>
          <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-80 md:justify-end">
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
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
          <p className="text-xs opacity-80">{t.rodape.precos}</p>
          <div className="flex items-center gap-4">
            {multilinguagem ? <SeletorLingua atual={lingua} rotulo={t.linguas} /> : null}
            <span className="text-xs opacity-80">{t.rodape.com}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
