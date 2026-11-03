import Link from "next/link";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import { AcaoPrincipal, AcoesSecundarias, ImagemCapa, type PropsCapa } from "./partes";

const PAPEL = "#F6F3EE";
const TINTA = "#141210";

/**
 * Bairro (taste skill «place-carries-it», herói «Menu column, sticky photograph»): duas folhas
 * lado a lado. À esquerda, uma folha de papel composta como a carta da casa, ao centro: o nome
 * numa serifa fina, a frase e a ação. À direita, a fachada (ou o logótipo) fixa, com uma barra de
 * papel em baixo com o horário e a morada.
 */
export function CapaBairro({ d, t, c }: PropsCapa) {
  return (
    <header
      id="capa"
      className="grid gap-3 p-3 md:min-h-svh md:grid-cols-2"
      style={{ backgroundColor: c.fundo }}
    >
      <div className="relative order-1 h-[56svh] overflow-hidden md:sticky md:top-3 md:order-2 md:h-[calc(100svh-24px)]">
        <ImagemCapa d={d} />
        <div
          className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4 text-sm"
          style={{ backgroundColor: PAPEL, color: TINTA }}
        >
          <span className="font-semibold">{d.estado}</span>
          <span>{[d.morada, d.cidade].filter(Boolean).join(", ")}</span>
        </div>
      </div>
      <div
        className="order-2 -mt-8 grid content-start justify-items-center gap-7 px-6 pt-8 pb-12 text-center md:order-1 md:mt-0 md:px-14 md:pt-8"
        style={{ backgroundColor: PAPEL, color: TINTA }}
      >
        <Link
          href={d.entrar}
          className="justify-self-end text-sm font-semibold underline-offset-4 hover:underline"
        >
          {t.capa.entrar}
        </Link>
        <h1
          className="titulo-estilo mt-[4svh] text-[14vw] leading-[0.9] text-balance md:mt-[14svh] md:text-[clamp(56px,5.6vw,96px)]"
          translate="no"
        >
          {d.nome}
        </h1>
        {d.cidade ? <p className="text-lg">{t.capa.barbeariaEm(d.cidade)}</p> : null}
        <div className="grid w-full max-w-md gap-3 text-left">
          <AcaoPrincipal d={d} t={t} c={coresDaCapa(d.cor, PAPEL)} vagaClasse="text-3xl" />
          <AcoesSecundarias d={d} t={t} />
        </div>
      </div>
    </header>
  );
}
