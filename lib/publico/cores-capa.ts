import { corDoTexto, razaoContraste } from "@/lib/regras/contraste";

// As cores da capa (D-198). O fundo é o do logótipo, quando o logótipo tem fundo, para encaixar
// na página; senão, a cor da barbearia. A cor da barbearia fica para o botão principal, se se
// distinguir do fundo; senão, o botão usa a cor do texto.

export type CoresCapa = { fundo: string; tinta: string; destaque: string; tintaDestaque: string };

export function coresDaCapa(cor: string, logoFundo: string | null): CoresCapa {
  const fundo = logoFundo ?? cor;
  const tinta = corDoTexto(fundo);
  const destaque = razaoContraste(cor, fundo) >= 2 ? cor : tinta;
  return { fundo, tinta, destaque, tintaDestaque: corDoTexto(destaque) };
}
