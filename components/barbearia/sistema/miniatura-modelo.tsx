import type { ReactNode } from "react";
import type { Estilo } from "@/lib/publico/estilos";
import { cabecalhosDaMiniatura } from "./miniatura-cabecalhos";
import { partesDaMiniatura } from "./miniatura-partes";

// A miniatura de cada modelo (D-199, D-201): a página em ponto pequeno, com o cabeçalho na cor
// escolhida pela barbearia, o corpo na paleta do modelo (coluna, lateral, editorial ou bento), o raio
// dos cartões e o nome na letra do modelo.

export function MiniaturaModelo({
  estilo,
  cor,
  nome,
}: {
  estilo: Estilo;
  cor: string;
  nome: string;
}) {
  const x = partesDaMiniatura(estilo, cor, nome);
  const { m, p, TINTA_CORPO, Peca, cartao } = x;
  const cabecalhos = cabecalhosDaMiniatura(x, cor);
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
    bento: (
      <span className="grid grid-cols-6 gap-1 px-3 py-2">
        {cartao("col-span-4 row-span-2 h-full min-h-9")}
        {cartao("col-span-2 h-4")}
        {cartao("col-span-2 h-4")}
        {cartao("col-span-3 h-3")}
        {cartao("col-span-3 h-3")}
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
      style={{ backgroundColor: p.fundo }}
    >
      {cabecalhos[m.cabecalho]}
      {corpos[m.corpo]}
    </span>
  );
}
