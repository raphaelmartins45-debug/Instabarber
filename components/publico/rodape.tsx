import Link from "next/link";
import type { Lingua, TextosPublicos } from "@/lib/i18n/publico";
import type { CoresCapa } from "@/lib/publico/cores-capa";
import type { Estilo } from "@/lib/publico/estilos";
import { NomeMonumento } from "./nome-monumento";
import { SeletorLingua } from "./seletor-lingua";

/**
 * Rodapé da página pública (E.6, H.2): Privacidade, Termos, Livro de Reclamações eletrónico,
 * avaliar no Google, a área de cliente e, com `multilinguagem`, o seletor PT · EN · FR. Fecha com
 * o nome da barbearia outra vez de margem a margem, nas cores da capa (D-198).
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
  estilo,
  cores,
}: {
  nome: string;
  estilo: Estilo;
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
      className="grid gap-16 overflow-hidden px-4 pt-12 pb-28 text-sm md:px-8 md:pb-6"
      style={{ backgroundColor: cores.fundo, color: cores.tinta }}
    >
      <div className="grid gap-4">
        <nav aria-label={t.rodape.acessos} className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href={entrar} className={ligacao}>
            {t.entrar.cliente}
          </Link>
        </nav>
        <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-70">
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
        <p className="text-xs opacity-70">{t.rodape.precos}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {multilinguagem ? <SeletorLingua atual={lingua} rotulo={t.linguas} /> : <span />}
          <span className="text-xs opacity-70">{t.rodape.com}</span>
        </div>
      </div>
      <NomeMonumento nome={nome} estilo={estilo} como="p" />
    </footer>
  );
}
