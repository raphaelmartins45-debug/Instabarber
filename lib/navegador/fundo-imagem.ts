import { fundoDoLogo } from "@/lib/regras/paleta";

// Só no navegador (D-198): desenha a imagem num canvas pequeno e lê a cor da orla. Nulo se não
// der (SVG sem medidas, imagem de outro domínio sem CORS, orla variada ou transparente).

const LADO = 48;

export function fundoDaImagem(fonte: string | File): Promise<string | null> {
  return new Promise((ok) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = LADO;
        canvas.height = LADO;
        const ctx = canvas.getContext("2d");
        if (!ctx) return ok(null);
        ctx.drawImage(img, 0, 0, LADO, LADO);
        ok(fundoDoLogo(ctx.getImageData(0, 0, LADO, LADO).data, LADO, LADO));
      } catch {
        ok(null);
      }
    };
    img.onerror = () => ok(null);
    img.src = typeof fonte === "string" ? fonte : URL.createObjectURL(fonte);
  });
}
