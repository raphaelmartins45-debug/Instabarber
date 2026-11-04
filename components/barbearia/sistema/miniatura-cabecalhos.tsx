import type { ReactNode } from "react";
import type { Modelo } from "@/lib/publico/estilos";
import type { PartesMiniatura } from "./miniatura-partes";

/** O cabeçalho de cada arrumação, em ponto pequeno, para as miniaturas (D-199, D-204). */
export function cabecalhosDaMiniatura(
  x: PartesMiniatura,
  cor: string,
): Record<Modelo["cabecalho"], ReactNode> {
  const { p, c, raio, TINTA_CORPO, Nome, Peca, logo, acoes } = x;
  return {
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
          className="absolute inset-x-[18%] top-4 grid justify-items-center gap-0.5 px-2 py-1"
          style={{
            borderRadius: raio,
            backgroundColor: p.cartao,
            boxShadow: `inset 0 0 0 1px ${p.borda}`,
          }}
        >
          <Nome className="max-w-full text-[10px]" tinta={TINTA_CORPO} />
          {acoes(p.destaque, TINTA_CORPO)}
        </span>
      </span>
    ),
    painel: (
      <span className="grid grid-cols-2" style={{ backgroundColor: p.fundo }}>
        <span className="grid h-14 place-items-center" style={{ backgroundColor: c.fundo }}>
          {logo}
        </span>
        <span className="grid content-center gap-1 px-2">
          <Nome className="text-[11px]" tinta={TINTA_CORPO} />
          {acoes(p.destaque, TINTA_CORPO)}
        </span>
      </span>
    ),
    destaque: (
      <span
        className="grid justify-items-center gap-1 px-3 py-4"
        style={{ backgroundColor: c.fundo }}
      >
        <Peca className="size-3" fundo={c.tinta} />
        <Nome className="max-w-full text-[15px]" />
        {acoes()}
      </span>
    ),
    loja: (
      <span className="relative block h-14">
        <span className="absolute inset-x-0 top-0 h-6" style={{ backgroundColor: c.fundo }} />
        <span
          className="absolute inset-x-[6%] top-3 grid gap-1 px-2 py-1.5"
          style={{
            borderRadius: raio,
            backgroundColor: p.cartao,
            boxShadow: `inset 0 0 0 1px ${p.borda}`,
          }}
        >
          <span className="flex items-center gap-1.5">
            <Peca className="size-4 shrink-0" fundo={cor} />
            <Nome className="text-[10px]" tinta={TINTA_CORPO} />
          </span>
          <span className="flex gap-1">
            <Peca className="h-1.5 w-6" fundo={p.destaque} />
            <Peca className="h-1.5 w-6" fundo={p.camada} />
            <Peca className="h-1.5 w-6" fundo={p.camada} />
          </span>
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
        <span
          className="grid w-[40%] gap-0.5 p-1"
          style={{ borderRadius: raio, backgroundColor: p.cartao }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex justify-between gap-1">
              <Peca className="h-1 w-6" fundo={p.camada} />
              <Peca className="h-1 w-2" fundo={TINTA_CORPO} />
            </span>
          ))}
        </span>
      </span>
    ),
  };
}
