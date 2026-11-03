import type { CSSProperties } from "react";
import { ACABAMENTO, nomeMonumento, type Estilo } from "@/lib/publico/estilos";
import { cn } from "@/lib/utils";

/**
 * O nome da barbearia em grande (D-198), na letra do título do modelo. O título tem o nome uma
 * só vez (para leitores de ecrã); por baixo, duas composições visuais: no telemóvel uma palavra
 * por linha, no computador uma ou duas linhas. Os tamanhos vêm de `nomeMonumento`; `largo` e
 * `estreito` deixam cada modelo dar ao nome só uma parte da largura.
 */
export function NomeMonumento({
  nome,
  estilo,
  className,
  como: Etiqueta = "h1",
  largo,
  estreito,
}: {
  nome: string;
  estilo: Estilo;
  className?: string;
  como?: "h1" | "p";
  largo?: { util?: number; maximo?: number };
  estreito?: { util?: number; maximo?: number };
}) {
  const a = ACABAMENTO[estilo];
  const composicao = (ecra: "largo" | "estreito", classe: string) => {
    const { linhas, vw } = nomeMonumento(nome, estilo, ecra, ecra === "largo" ? largo : estreito);
    const estilos: CSSProperties = {
      fontSize: `${vw.toFixed(2)}vw`,
      letterSpacing: `${a.espacamento}em`,
      textTransform: a.maiusculas ? "uppercase" : a.minusculas ? "lowercase" : "none",
    };
    return (
      <span aria-hidden className={cn("leading-[0.86] whitespace-nowrap", classe)} style={estilos}>
        {linhas.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </span>
    );
  };
  return (
    <Etiqueta className={cn("titulo-estilo", className)} translate="no">
      <span className="sr-only">{nome}</span>
      {composicao("estreito", "block md:hidden")}
      {composicao("largo", "hidden md:block")}
    </Etiqueta>
  );
}
