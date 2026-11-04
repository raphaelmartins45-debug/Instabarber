import type { CSSProperties, ReactNode } from "react";
import { MODELOS, type Estilo } from "@/lib/publico/estilos";
import { variavelDoEstilo } from "./fontes";

// O invólucro da página pública (D-198, D-201): as letras e a paleta do modelo. Redefine os
// tokens do sistema (fundo, cartão, texto, borda, destaque) só dentro da página, para os blocos
// seguirem o modelo sem saberem dele.

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");

export function PaginaModelo({
  estilo,
  lingua,
  children,
}: {
  estilo: Estilo;
  lingua: string;
  children: ReactNode;
}) {
  const m = MODELOS[estilo];
  const p = m.paleta;
  return (
    <div
      lang={lingua}
      data-estilo={estilo}
      className={`pagina-publica bg-background text-foreground ${variavelDoEstilo(estilo)}`}
      style={
        {
          colorScheme: p.escuro ? "dark" : "light",
          "--peso-titulo": m.peso,
          "--raio": `${m.raio}px`,
          "--sup-fundo": p.fundo,
          "--sup-cartao": p.cartao,
          "--sup-elevado": p.cartao,
          "--sup-camada": p.camada,
          "--borda": p.borda,
          "--borda-forte": p.borda,
          "--texto": p.texto,
          "--texto-2": p.texto2,
          "--texto-3": p.texto2,
          "--campo": `color-mix(in srgb, ${p.texto} 5%, transparent)`,
          "--ac": p.destaque,
          "--ac-hi": p.destaque,
          "--ac-sobre": p.sobreDestaque,
          "--ac-rgb": rgb(p.destaque),
          "--ac-texto": p.texto,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
