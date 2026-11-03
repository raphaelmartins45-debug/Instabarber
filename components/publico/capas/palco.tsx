import Link from "next/link";
import { NomeMonumento } from "../nome-monumento";
import { AcaoPrincipal, AcoesSecundarias, ImagemCapa, linhaMorada, type PropsCapa } from "./partes";

const CAMPO = "#141210";
const TINTA = "#F2EFEA";

/**
 * Palco (taste skill «split-stage», herói «Inset photograph, crossing wordmark»): um campo
 * escuro; a imagem alta à esquerda, recolhida das margens; à direita a frase e a ação; o nome em
 * minúsculas ao longo da base, a começar por cima da imagem e a acabar na margem direita.
 */
export function CapaPalco({ d, t, c }: PropsCapa) {
  return (
    <header
      id="capa"
      className="relative grid min-h-svh overflow-hidden md:grid-cols-[47%_1fr]"
      style={{ backgroundColor: CAMPO, color: TINTA }}
    >
      <div className="h-[58svh] p-3 md:h-svh md:p-5">
        <div className="size-full overflow-hidden">
          <ImagemCapa d={d} />
        </div>
      </div>
      <div className="relative z-10 grid content-between gap-8 px-5 pt-6 pb-4 md:px-12 md:pt-8 md:pb-[14vw]">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm opacity-80">{d.cidade}</p>
          <Link
            href={d.entrar}
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            {t.capa.entrar}
          </Link>
        </div>
        <div className="grid max-w-md gap-5">
          <p className="text-2xl leading-snug">{linhaMorada(d)}</p>
          <AcaoPrincipal d={d} t={t} c={c} vagaClasse="text-3xl md:text-4xl" />
          <AcoesSecundarias d={d} t={t} />
        </div>
      </div>
      <NomeMonumento
        nome={d.nome}
        estilo={d.estilo}
        className="z-20 px-4 pb-4 md:absolute md:right-8 md:bottom-3 md:px-0 md:pb-0 md:text-right"
        largo={{ util: 64, maximo: 14 }}
        estreito={{ util: 86, maximo: 20 }}
      />
    </header>
  );
}
