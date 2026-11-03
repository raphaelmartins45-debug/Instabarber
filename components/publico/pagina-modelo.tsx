import type { CSSProperties, ReactNode } from "react";
import { ACABAMENTO, type Estilo } from "@/lib/publico/estilos";
import { variavelDoEstilo } from "./fontes";

// O invólucro da página pública (D-198): as letras do modelo e as cores das secções. Redefine os
// tokens do sistema (fundo, texto, camada, destaque) só dentro da página, para todos os blocos
// seguirem o modelo sem saberem dele.

const FUNDOS = {
  claro: { fundo: "#F6F3EE", texto: "#141210", camada: "#EAE5DD", texto2: "#5E5850" },
  escuro: { fundo: "#0F0E0D", texto: "#F2EFEA", camada: "#1E1C1A", texto2: "#A8A29A" },
};

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
  const a = ACABAMENTO[estilo];
  const f = FUNDOS[a.fundo];
  return (
    <div
      lang={lingua}
      data-estilo={estilo}
      className={`pagina-publica bg-background text-foreground ${variavelDoEstilo(estilo)}`}
      style={
        {
          "--peso-titulo": a.peso,
          "--sup-fundo": f.fundo,
          "--texto": f.texto,
          "--sup-camada": f.camada,
          "--texto-2": f.texto2,
          "--ac-rgb": rgb(cor),
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
