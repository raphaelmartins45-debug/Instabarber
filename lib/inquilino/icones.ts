// Ícone e manifesto de cada barbearia (pendente do trabalho paralelo, D-123): gerados a partir
// do logótipo e da cor da capa, com o «IB» da marca quando não há logótipo. O endereço muda com
// o logótipo, para furar a cache do iOS (D-107).

export const TAMANHOS_ICONE = [32, 180, 192, 512] as const;
export type TamanhoIcone = (typeof TAMANHOS_ICONE)[number];

export function tamanhoIcone(texto: string | null): TamanhoIcone {
  const n = Number(texto);
  return (TAMANHOS_ICONE as readonly number[]).includes(n) ? (n as TamanhoIcone) : 192;
}

/** Uma versão curta do logótipo para o endereço do ícone (muda quando o logótipo muda). */
export function versaoIcone(logo: string | null): string {
  if (!logo) return "ib";
  let h = 0;
  for (const c of logo) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h).toString(36);
}

export function enderecoIcone(slug: string, tamanho: TamanhoIcone, logo: string | null): string {
  return `/api/icone/${slug}?t=${tamanho}&v=${versaoIcone(logo)}`;
}

/** O logótipo só entra no ícone em formato de imagem (o SVG fica com o «IB»). */
export function logoParaIcone(logo: string | null): string | null {
  return logo && /\.(png|webp|jpe?g)(\?|$)/i.test(logo) ? logo : null;
}
