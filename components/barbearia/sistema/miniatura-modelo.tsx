import type { CSSProperties, ReactNode } from "react";
import { LETRA_DO_ESTILO } from "@/components/publico/fontes";
import { coresDaCapa, FUNDO_CORPO } from "@/lib/publico/cores-capa";
import { MODELOS, type Estilo } from "@/lib/publico/estilos";
import { cn } from "@/lib/utils";

// A miniatura de cada modelo (D-199, D-200): a página em ponto pequeno, com a arrumação do
// cabeçalho na cor da barbearia e a do corpo claro (coluna, lateral ou editorial), o raio dos
// cartões e o nome na letra do modelo.

const TINTA_CORPO = "#161412";

export function MiniaturaModelo({
  estilo,
  cor,
  nome,
}: {
  estilo: Estilo;
  cor: string;
  nome: string;
}) {
  const m = MODELOS[estilo];
  const c = coresDaCapa(cor, null);
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
        boxShadow: borda ? "inset 0 0 0 1px rgba(22,20,18,0.12)" : undefined,
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
  const cartao = (className: string) => <Peca className={className} fundo="#FFFFFF" borda />;

  const cabecalhos: Record<typeof m.cabecalho, ReactNode> = {
    centrado: (
      <span
        className="grid justify-items-center gap-1 px-3 py-2.5"
        style={{ backgroundColor: c.fundo }}
      >
        {logo}
        <Nome className="max-w-full text-[11px]" />
        {acoes()}
      </span>
    ),
    dividido: (
      <span className="flex items-center gap-3 px-3 py-3" style={{ backgroundColor: c.fundo }}>
        <Peca className="size-8 shrink-0" fundo={c.tinta} />
        <span className="grid min-w-0 gap-1">
          <Nome className="text-[11px]" />
          {acoes()}
        </span>
      </span>
    ),
    faixa: (
      <span className="flex items-center gap-2 px-3 py-2.5" style={{ backgroundColor: c.fundo }}>
        <span className="grid min-w-0 flex-1 gap-1">
          <Nome className="text-[15px]" />
          {acoes()}
        </span>
        <Peca className="size-8 shrink-0" fundo={c.tinta} />
      </span>
    ),
    cartao: (
      <span className="relative block h-12">
        <span
          className="absolute inset-x-0 top-0 grid h-7 justify-items-center pt-1"
          style={{ backgroundColor: c.fundo }}
        >
          <Peca className="size-3" fundo={c.tinta} />
        </span>
        <span
          className="absolute inset-x-[18%] top-4 grid justify-items-center gap-0.5 bg-white px-2 py-1"
          style={{ borderRadius: raio, boxShadow: "inset 0 0 0 1px rgba(22,20,18,0.12)" }}
        >
          <Nome className="max-w-full text-[10px]" tinta={TINTA_CORPO} />
          {acoes(c.destaque === c.tinta ? TINTA_CORPO : cor, TINTA_CORPO)}
        </span>
      </span>
    ),
    painel: (
      <span className="grid grid-cols-2">
        <span className="grid h-14 place-items-center" style={{ backgroundColor: c.fundo }}>
          {logo}
        </span>
        <span className="grid content-center gap-1 px-2">
          <Nome className="text-[11px]" tinta={TINTA_CORPO} />
          {acoes(c.destaque === c.tinta ? TINTA_CORPO : cor, TINTA_CORPO)}
        </span>
      </span>
    ),
    montra: (
      <span className="flex items-center gap-2 px-3 py-2.5" style={{ backgroundColor: c.fundo }}>
        <span className="grid min-w-0 flex-1 gap-1">
          <Peca className="size-3" fundo={c.tinta} />
          <Nome className="text-[11px]" />
          {acoes()}
        </span>
        <span className="grid w-[40%] gap-0.5 bg-white p-1" style={{ borderRadius: raio }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex justify-between gap-1">
              <Peca className="h-1 w-6" fundo="#C9C4BC" />
              <Peca className="h-1 w-2" fundo={TINTA_CORPO} />
            </span>
          ))}
        </span>
      </span>
    ),
  };

  const servicos =
    m.servicos === "lista" ? (
      cartao("h-7 w-full")
    ) : (
      <span className="grid grid-cols-2 gap-1">
        {cartao("h-5")}
        {cartao("h-5")}
      </span>
    );
  const titulo = <Peca className="h-1.5 w-8" fundo={TINTA_CORPO} />;
  const corpos: Record<typeof m.corpo, ReactNode> = {
    coluna: (
      <span className="grid gap-1.5 px-3 py-2">
        {titulo}
        {servicos}
        <span className="grid grid-cols-3 gap-1">
          {cartao("h-4")}
          {cartao("h-4")}
          {cartao("h-4")}
        </span>
      </span>
    ),
    lateral: (
      <span className="grid grid-cols-[1fr_30%] gap-1.5 px-3 py-2">
        <span className="grid content-start gap-1.5">
          {titulo}
          {servicos}
        </span>
        <span className="grid content-start gap-1">
          {cartao("h-4")}
          {cartao("h-6")}
        </span>
      </span>
    ),
    editorial: (
      <span className="grid gap-1.5 px-3 py-2">
        {[0, 1].map((i) => (
          <span key={i} className="grid grid-cols-[22%_1fr] gap-2">
            {titulo}
            {i === 0 ? servicos : cartao("h-4")}
          </span>
        ))}
      </span>
    ),
  };

  return (
    <span
      className="block aspect-[16/10] w-full overflow-hidden"
      style={{ backgroundColor: FUNDO_CORPO }}
    >
      {cabecalhos[m.cabecalho]}
      {corpos[m.corpo]}
    </span>
  );
}
