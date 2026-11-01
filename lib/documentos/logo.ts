import "server-only";
import { createElement } from "react";
import { ImageResponse } from "next/og";
import type { Imagem } from "@/lib/pdf/guia-primitivas";

// O logótipo da barbearia para os PDFs (D-181, D-184). O jsPDF aceita PNG, JPEG e WebP; um SVG
// passa a PNG pelo desenhador de imagens do próprio Next (next/og), sem dependências novas. Uma
// imagem que não chega a tempo ou não se consegue ler dá nulo, e o PDF usa a inicial do nome.

const FORMATOS: Record<string, Imagem["formato"]> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WEBP",
};
const MAXIMO = 3 * 1024 * 1024;
const LADO = 512;

async function svgParaPng(svg: Buffer): Promise<Imagem | null> {
  const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  const resposta = new ImageResponse(
    createElement(
      "div",
      { style: { width: "100%", height: "100%", display: "flex", justifyContent: "center" } },
      createElement("img", { src, width: LADO, height: LADO, style: { objectFit: "contain" } }),
    ),
    { width: LADO, height: LADO },
  );
  const png = Buffer.from(await resposta.arrayBuffer());
  return png.length ? { dados: png.toString("base64"), formato: "PNG" } : null;
}

export async function lerLogo(url: string | null): Promise<Imagem | null> {
  if (!url) return null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!r.ok) return null;
    const tipo = (r.headers.get("content-type") ?? "").split(";")[0]!.trim();
    const dados = Buffer.from(await r.arrayBuffer());
    if (dados.length > MAXIMO) return null;
    if (tipo === "image/svg+xml" || /\.svg(\?|$)/i.test(url)) return await svgParaPng(dados);
    const formato = FORMATOS[tipo];
    return formato ? { dados: dados.toString("base64"), formato } : null;
  } catch {
    return null;
  }
}
