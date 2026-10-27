import "server-only";
import type { Imagem } from "@/lib/pdf/guia-primitivas";

// O logótipo da barbearia para os PDFs (D-181). O jsPDF aceita PNG, JPEG e WebP; um SVG ou uma
// imagem que não chega a tempo dá nulo, e o PDF usa a inicial do nome.

const FORMATOS: Record<string, Imagem["formato"]> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WEBP",
};
const MAXIMO = 3 * 1024 * 1024;

export async function lerLogo(url: string | null): Promise<Imagem | null> {
  if (!url) return null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
    const formato = FORMATOS[(r.headers.get("content-type") ?? "").split(";")[0]!.trim()];
    if (!r.ok || !formato) return null;
    const dados = Buffer.from(await r.arrayBuffer());
    if (dados.length > MAXIMO) return null;
    return { dados: dados.toString("base64"), formato };
  } catch {
    return null;
  }
}
