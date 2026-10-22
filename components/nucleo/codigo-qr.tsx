import { codigoQr } from "@/lib/regras/qr";

/** Código QR em SVG, com a margem de quatro módulos que a norma pede. */
export function CodigoQr({ texto, rotulo }: { texto: string; rotulo: string }) {
  const m = codigoQr(texto);
  if (!m) return null;
  const lado = m.length + 8;
  const caminho = m
    .flatMap((linha, y) => linha.map((escuro, x) => (escuro ? `M${x + 4} ${y + 4}h1v1h-1z` : "")))
    .join("");
  return (
    <svg
      viewBox={`0 0 ${lado} ${lado}`}
      role="img"
      aria-label={rotulo}
      className="aspect-square w-full max-w-80 bg-white"
      shapeRendering="crispEdges"
    >
      <path d={caminho} fill="#000" />
    </svg>
  );
}
