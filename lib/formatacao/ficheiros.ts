import { textos } from "@/lib/i18n/pt-PT";

// O que um carregamento aceita, para mostrar por baixo do botão: «Formatos: JPG, WEBP. Até 3 MB.
// Mínimo 1600 × 900 px.» A regra vem de quem verifica (lib/regras/imagens.ts e os repositórios).

const t = textos.ficheiros;

export type RegraFicheiro = {
  formatos: readonly string[];
  maxBytes?: number;
  minLargura?: number;
  minAltura?: number;
};

export function descreverFicheiro(r: RegraFicheiro): string {
  const formatos = [...new Set(r.formatos.map((f) => t.formatos[f] ?? f))].join(", ");
  const mb = r.maxBytes ? Math.round((r.maxBytes / (1024 * 1024)) * 10) / 10 : null;
  const medidas = r.minLargura && r.minAltura ? t.minimo(r.minLargura, r.minAltura) : "";
  return `${t.aceita(formatos, mb)}${medidas}`;
}
