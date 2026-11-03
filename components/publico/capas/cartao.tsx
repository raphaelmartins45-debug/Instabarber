import Link from "next/link";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import { AcaoPrincipal, AcoesSecundarias, ImagemCapa, linhaMorada, type PropsCapa } from "./partes";

const PAPEL = "#F6F3EE";
const TINTA = "#141210";

/**
 * Cartão (taste skill «page-is-the-object», herói «Striped card beside the room»): a página é o
 * cartão da casa. À esquerda, um cartão de papel com a faixa às riscas do poste de barbeiro na
 * cor da barbearia, o nome, a morada e a ação; à direita, a imagem fixa. O fundo à volta é a cor.
 */
export function CapaCartao({ d, t }: PropsCapa) {
  // As cores sobre o papel: o botão na cor da barbearia, se se distinguir do papel.
  const papel = coresDaCapa(d.cor, PAPEL);
  return (
    <header
      id="capa"
      className="grid gap-3 p-3 md:min-h-svh md:grid-cols-2"
      style={{ backgroundColor: d.cor }}
    >
      <div
        className="order-2 -mt-9 grid content-start md:order-1 md:mt-0"
        style={{ backgroundColor: PAPEL, color: TINTA }}
      >
        {/* A faixa às riscas do poste de barbeiro: blocos cheios alternados, 28 px cada. */}
        <div aria-hidden className="flex h-10 overflow-hidden md:h-14">
          {Array.from({ length: 48 }, (_, i) => (
            <span
              key={i}
              className="w-7 shrink-0"
              style={{ backgroundColor: i % 2 ? PAPEL : d.cor }}
            />
          ))}
        </div>
        <div className="grid justify-items-center gap-6 px-6 pt-10 pb-10 text-center md:px-12 md:pt-[10svh]">
          <Link
            href={d.entrar}
            className="justify-self-end text-sm font-semibold underline-offset-4 hover:underline"
          >
            {t.capa.entrar}
          </Link>
          <h1
            className="titulo-estilo text-[13vw] leading-[0.92] text-balance md:text-[clamp(48px,4.6vw,76px)]"
            translate="no"
          >
            {d.nome}
          </h1>
          <p className="max-w-[36ch] text-lg">{linhaMorada(d)}</p>
          <AcaoPrincipal
            d={d}
            t={t}
            c={papel}
            className="w-full max-w-md text-left"
            vagaClasse="text-3xl"
          />
          <div className="w-full max-w-md text-left">
            <AcoesSecundarias d={d} t={t} />
          </div>
        </div>
      </div>
      <div className="order-1 h-[48svh] overflow-hidden md:sticky md:top-3 md:order-2 md:h-[calc(100svh-24px)]">
        <ImagemCapa d={d} />
      </div>
    </header>
  );
}
