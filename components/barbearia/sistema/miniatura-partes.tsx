import type { CSSProperties } from "react";
import { LETRA_DO_ESTILO } from "@/components/publico/fontes";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import { MODELOS, type Estilo } from "@/lib/publico/estilos";
import { cn } from "@/lib/utils";

// As peças das miniaturas dos modelos (D-199, D-201, D-204): o nome na letra do modelo, blocos na
// paleta dele e as cores do cabeçalho (a cor escolhida pela barbearia).

export function partesDaMiniatura(estilo: Estilo, cor: string, nome: string) {
  const m = MODELOS[estilo];
  const p = m.paleta;
  const c = coresDaCapa(p.destaque, cor);
  const TINTA_CORPO = p.texto;
  const raio = `${Math.min(m.raio / 3, 5)}px`;
  const letra: CSSProperties = {
    fontWeight: m.peso,
    textTransform: m.maiusculas ? "uppercase" : "none",
  };
  const Nome = ({ className, tinta = c.tinta }: { className?: string; tinta?: string }) => (
    <span
      className={cn(LETRA_DO_ESTILO[estilo], "block truncate leading-tight", className)}
      style={{ ...letra, color: tinta }}
      translate="no"
    >
      {nome}
    </span>
  );
  const Peca = ({
    className,
    fundo,
    borda,
  }: {
    className?: string;
    fundo: string;
    borda?: boolean;
  }) => (
    <span
      aria-hidden
      className={cn("block", className)}
      style={{
        backgroundColor: fundo,
        borderRadius: raio,
        boxShadow: borda ? `inset 0 0 0 1px ${p.borda}` : undefined,
      }}
    />
  );
  const logo = <Peca className="size-5 shrink-0" fundo={c.tinta} />;
  const acoes = (destaque = c.destaque, outra = c.tinta) => (
    <span className="flex gap-1">
      <Peca className="h-2 w-8" fundo={destaque} />
      <Peca className="h-2 w-5 opacity-40" fundo={outra} />
    </span>
  );
  const cartao = (className: string) => <Peca className={className} fundo={p.cartao} borda />;

  return { m, p, c, raio, TINTA_CORPO, Nome, Peca, logo, acoes, cartao };
}

export type PartesMiniatura = ReturnType<typeof partesDaMiniatura>;
