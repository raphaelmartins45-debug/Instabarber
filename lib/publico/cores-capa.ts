import { corDoTexto, razaoContraste } from "@/lib/regras/contraste";

// As cores da marca na página pública (D-198, D-200). O cabeçalho e o rodapé têm o fundo do
// logótipo, quando o logótipo tem fundo, para ele encaixar; senão, a cor da barbearia. O botão do
// cabeçalho tem a cor da barbearia se se distinguir desse fundo; senão, a cor do texto.

export type CoresCapa = { fundo: string; tinta: string; destaque: string; tintaDestaque: string };

/** O fundo claro do corpo da página, igual em todos os modelos. */
export const FUNDO_CORPO = "#F5F3EF";

export function coresDaCapa(cor: string, logoFundo: string | null): CoresCapa {
  const fundo = logoFundo ?? cor;
  const tinta = corDoTexto(fundo);
  const destaque = razaoContraste(cor, fundo) >= 2 ? cor : tinta;
  return { fundo, tinta, destaque, tintaDestaque: corDoTexto(destaque) };
}

/**
 * Os botões no corpo claro: a cor da barbearia, ou o escuro quando ela é tão clara que o botão
 * se perderia no fundo.
 */
export function botaoDoCorpo(cor: string): { fundo: string; tinta: string } {
  const fundo = razaoContraste(cor, FUNDO_CORPO) >= 1.6 ? cor : "#161412";
  return { fundo, tinta: corDoTexto(fundo) };
}
