import type { CSSProperties, ReactNode } from "react";
import { botaoDoCorpo, FUNDO_CORPO } from "@/lib/publico/cores-capa";
import { MODELOS, type Estilo } from "@/lib/publico/estilos";
import { variavelDoEstilo } from "./fontes";

// O invólucro da página pública (D-198, D-200): as letras do modelo e um corpo claro, igual em
// todos os modelos, para se ler bem. Redefine os tokens do sistema (fundo, cartão, texto, borda,
// destaque) só dentro da página, para os blocos seguirem o modelo sem saberem dele.

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");

export function PaginaModelo({
  estilo,
  cor,
  lingua,
  children,
}: {
  estilo: Estilo;
  cor: string;
  lingua: string;
  children: ReactNode;
}) {
  const m = MODELOS[estilo];
  const botao = botaoDoCorpo(cor);
  return (
    <div
      lang={lingua}
      data-estilo={estilo}
      className={`pagina-publica bg-background text-foreground ${variavelDoEstilo(estilo)}`}
      style={
        {
          colorScheme: "light",
          "--peso-titulo": m.peso,
          "--raio": `${m.raio}px`,
          "--sup-fundo": FUNDO_CORPO,
          "--sup-cartao": "#FFFFFF",
          "--sup-elevado": "#FFFFFF",
          "--sup-camada": "#ECE9E3",
          "--borda": "rgba(22, 20, 18, 0.10)",
          "--borda-forte": "rgba(22, 20, 18, 0.18)",
          "--texto": "#161412",
          "--texto-2": "#5A544D",
          "--texto-3": "#6B655D",
          "--campo": "rgba(22, 20, 18, 0.03)",
          "--ac": botao.fundo,
          "--ac-hi": botao.fundo,
          "--ac-sobre": botao.tinta,
          "--ac-rgb": rgb(botao.fundo),
          "--ac-texto": "#161412",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
