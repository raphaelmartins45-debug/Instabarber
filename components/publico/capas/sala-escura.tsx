import { NomeMonumento } from "../nome-monumento";
import { AcaoPrincipal, AcoesSecundarias, ImagemCapa, linhaMorada, type PropsCapa } from "./partes";
import Link from "next/link";

/**
 * Sala escura (taste skill «dark-room», herói «Name under a photograph»): a imagem em cima, em
 * toda a largura; por baixo, numa faixa escura, a frase e a ação, e o nome numa letra fina de
 * margem a margem. A única luz sólida é o botão.
 */
export function CapaSalaEscura({ d, t, c }: PropsCapa) {
  return (
    <header
      id="capa"
      className="grid min-h-svh grid-rows-[46svh_auto_auto] md:grid-rows-[46svh_1fr_auto]"
      style={{ backgroundColor: c.fundo, color: c.tinta }}
    >
      <div className="relative overflow-hidden">
        <ImagemCapa d={d} />
        <Link
          href={d.entrar}
          className="absolute top-5 right-5 px-3 py-2 text-sm font-semibold md:top-6 md:right-8"
          style={{ backgroundColor: c.fundo, color: c.tinta }}
        >
          {t.capa.entrar}
        </Link>
      </div>
      <div className="grid gap-6 px-4 pt-6 md:grid-cols-12 md:items-start md:gap-8 md:px-8">
        <p className="text-lg md:col-span-5">{linhaMorada(d)}</p>
        <div className="grid gap-3 md:col-span-5 md:col-start-8">
          <AcaoPrincipal d={d} t={t} c={c} vagaClasse="text-3xl md:text-4xl" />
          <AcoesSecundarias d={d} t={t} />
        </div>
      </div>
      <NomeMonumento nome={d.nome} estilo={d.estilo} className="self-end px-4 pt-8 pb-3 md:px-8" />
    </header>
  );
}
