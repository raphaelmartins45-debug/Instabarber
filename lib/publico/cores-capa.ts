import { corDoTexto, razaoContraste } from "@/lib/regras/contraste";

// As cores do cabeçalho da página pública (D-198, D-201): o fundo é a cor escolhida pela
// barbearia (onde o logótipo casa melhor); o botão tem a cor de destaque do modelo se se
// distinguir desse fundo; senão, a cor do texto.

export type CoresCapa = { fundo: string; tinta: string; destaque: string; tintaDestaque: string };

export function coresDaCapa(destaqueModelo: string, fundo: string): CoresCapa {
  const cor = destaqueModelo;
  const tinta = corDoTexto(fundo);
  const destaque = razaoContraste(cor, fundo) >= 2 ? cor : tinta;
  return { fundo, tinta, destaque, tintaDestaque: corDoTexto(destaque) };
}
