import { NomeMonumento } from "../nome-monumento";
import {
  AcaoPrincipal,
  AcoesSecundarias,
  ImagemCapa,
  linhaMorada,
  type PropsCapa,
  Topo,
} from "./partes";
import { corDoTexto } from "@/lib/regras/contraste";

/**
 * Cartaz (taste skill «loud-flat-poster», herói «Flush-left shout, seam photograph»): um campo
 * plano na cor da barbearia com o nome em letra muito pesada, encostado à esquerda; a imagem
 * colada como um recorte em arco, inclinada, a cavalo na costura com a faixa de baixo, onde
 * ficam a frase e a ação.
 */
export function CapaCartaz({ d, t }: PropsCapa) {
  const campo = d.cor;
  const tinta = corDoTexto(campo);
  // Na faixa de baixo as cores trocam: o botão tem a cor do campo, para gritar.
  const faixa = { fundo: tinta, tinta: campo, destaque: campo, tintaDestaque: tinta };
  return (
    <header id="capa" className="relative grid min-h-svh grid-rows-[1fr_auto] overflow-hidden">
      <div
        className="relative grid content-start gap-10 px-4 pt-5 pb-16 md:px-8 md:pt-7"
        style={{ backgroundColor: campo, color: tinta }}
      >
        <Topo d={d} t={t} />
        <NomeMonumento
          nome={d.nome}
          estilo={d.estilo}
          className="relative z-0 mt-[6svh] max-w-full"
          largo={{ util: 62, maximo: 15 }}
          estreito={{ util: 86, maximo: 22 }}
        />
        {d.foto || d.logo ? (
          <div className="absolute right-[-6%] bottom-[-14%] z-10 aspect-[3/4] w-[58%] rotate-[5deg] overflow-hidden rounded-t-full md:right-[10%] md:bottom-[-18%] md:w-[28%]">
            <ImagemCapa d={d} />
          </div>
        ) : null}
      </div>
      <div
        className="relative z-20 grid gap-5 px-4 py-6 md:grid-cols-12 md:items-end md:gap-8 md:px-8"
        style={{ backgroundColor: faixa.fundo, color: faixa.tinta }}
      >
        <div className="grid gap-3 md:col-span-5">
          <p className="text-xl font-semibold">{linhaMorada(d)}</p>
          <AcoesSecundarias d={d} t={t} />
        </div>
        <AcaoPrincipal
          d={d}
          t={t}
          c={faixa}
          className="md:col-span-5 md:col-start-8"
          vagaClasse="text-3xl md:text-4xl"
        />
      </div>
    </header>
  );
}
