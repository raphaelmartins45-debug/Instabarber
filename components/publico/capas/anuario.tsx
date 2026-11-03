import Link from "next/link";
import { AcaoPrincipal, AcoesSecundarias, linhaMorada, type PropsCapa } from "./partes";

/**
 * Anuário (taste skill «editorial-report», herói «Void, then statement on axis»): um vazio
 * composto. Tudo pende de um eixo a 42% da largura: na linha de topo, o logótipo à esquerda e as
 * ligações no eixo; no terço de baixo, o nome em duas linhas a partir do eixo e, à esquerda dele,
 * a frase e a ação. Sem imagem: um só tom e uma só tinta.
 */
export function CapaAnuario({ d, t, c }: PropsCapa) {
  return (
    <header
      id="capa"
      data-fundo-logo
      className="grid min-h-svh grid-rows-[auto_1fr_auto] gap-8 px-5 pt-8 pb-10 md:px-12 md:pt-11 md:pb-[72px]"
      style={{ backgroundColor: c.fundo, color: c.tinta }}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[42%_1fr_auto]">
        {d.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
          <img
            src={d.logo}
            alt={d.nome}
            className="h-10 w-auto justify-self-start object-contain md:h-12"
          />
        ) : (
          <span className="text-lg font-semibold">{d.nome}</span>
        )}
        <p className="hidden text-sm md:block">{linhaMorada(d)}</p>
        <Link href={d.entrar} className="text-sm font-semibold underline-offset-4 hover:underline">
          {t.capa.entrar}
        </Link>
      </div>
      <div />
      <div className="grid gap-10 md:grid-cols-[42%_1fr] md:items-end">
        <h1
          className="titulo-estilo text-[12.5vw] leading-[0.95] text-balance md:order-2 md:text-[clamp(64px,8.5vw,140px)]"
          translate="no"
        >
          {d.nome}
        </h1>
        <div className="grid max-w-sm gap-5 md:order-1 md:pr-10">
          <p className="text-lg opacity-80 md:hidden">{linhaMorada(d)}</p>
          <AcaoPrincipal d={d} t={t} c={c} vagaClasse="text-3xl" />
          <AcoesSecundarias d={d} t={t} />
        </div>
      </div>
    </header>
  );
}
