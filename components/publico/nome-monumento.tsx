import type { CSSProperties } from "react";
import { ACABAMENTO, nomeMonumento, type Estilo } from "@/lib/publico/estilos";
import { cn } from "@/lib/utils";
import { LETRA_DO_ESTILO } from "./fontes";

/**
 * O nome da barbearia como monumento (D-198): da margem esquerda à direita, na letra do estilo.
 * O título tem o nome uma só vez (para leitores de ecrã); por baixo, duas composições visuais:
 * no telemóvel uma palavra por linha, no computador uma ou duas linhas. Os tamanhos vêm de
 * `nomeMonumento`, para nunca quebrar nem ficar pequeno.
 */
export function NomeMonumento({
  nome,
  estilo,
  className,
  como: Etiqueta = "h1",
}: {
  nome: string;
  estilo: Estilo;
  className?: string;
  como?: "h1" | "p";
}) {
  const a = ACABAMENTO[estilo];
  const composicao = (ecra: "largo" | "estreito", classe: string) => {
    const { linhas, vw } = nomeMonumento(nome, estilo, ecra);
    const estilos: CSSProperties = {
      fontSize: `${vw.toFixed(2)}vw`,
      letterSpacing: `${a.espacamento}em`,
      textTransform: a.maiusculas ? "uppercase" : "none",
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
    <Etiqueta className={cn(LETRA_DO_ESTILO[estilo], className)} translate="no">
      <span className="sr-only">{nome}</span>
      {composicao("estreito", "block md:hidden")}
      {composicao("largo", "hidden md:block")}
    </Etiqueta>
  );
}
