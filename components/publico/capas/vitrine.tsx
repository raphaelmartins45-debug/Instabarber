import Link from "next/link";
import { ListaVitrine } from "./lista-vitrine";
import { AcaoPrincipal, AcoesSecundarias, ImagemCapa, linhaMorada, type PropsCapa } from "./partes";

/**
 * Vitrine (taste skill «specimen-catalogue», herói «Single specimen with name list»): um fundo
 * calmo; o nome em cima, à esquerda, grande como uma marca; ao centro, um expositor com o
 * logótipo (ou a fachada); ao lado, a lista dos serviços, a parte viva. Sem serviços, a ação
 * principal de sempre.
 */
export function CapaVitrine({ d, t, c }: PropsCapa) {
  return (
    <header
      id="capa"
      className="grid min-h-svh content-start gap-8 bg-background px-5 pt-8 pb-10 text-foreground md:px-14 md:pt-14"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <h1
          className="titulo-estilo text-[14vw] leading-[0.9] md:text-[clamp(64px,6vw,92px)]"
          translate="no"
        >
          {d.nome}
        </h1>
        <div className="grid gap-1 text-[15px] md:max-w-xs md:text-right">
          <p>{linhaMorada(d)}</p>
          <Link href={d.entrar} className="font-semibold underline-offset-4 hover:underline">
            {t.capa.entrar}
          </Link>
        </div>
      </div>
      {d.servicos.length ? (
        <ListaVitrine
          servicos={d.servicos}
          marcar={d.aberta ? d.marcar : null}
          rotuloLista={t.blocos.servicos}
          rotuloMarcar={t.capa.marcarAgora}
          destaque={c.destaque}
          tintaDestaque={c.tintaDestaque}
          expositor={<ImagemCapa d={d} />}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[400px_1fr] md:items-center md:gap-10">
          <div className="aspect-[4/5] w-full overflow-hidden">
            <ImagemCapa d={d} />
          </div>
          <AcaoPrincipal d={d} t={t} c={c} />
        </div>
      )}
      <div className="max-w-md">
        <AcoesSecundarias d={d} t={t} />
      </div>
    </header>
  );
}
