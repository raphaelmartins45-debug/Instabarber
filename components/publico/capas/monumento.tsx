import type { CSSProperties } from "react";
import { NomeMonumento } from "../nome-monumento";
import { AcaoPrincipal, AcoesSecundarias, ImagemCapa, type PropsCapa, Topo } from "./partes";

/**
 * Monumento (taste skill «name-as-monument»): o nome de margem a margem na base do primeiro
 * ecrã; o logótipo solto sobre a cor do fundo dele; a ação principal à direita.
 */
export function CapaMonumento({ d, t, c }: PropsCapa) {
  return (
    <header
      id="capa"
      data-fundo-logo
      style={{ backgroundColor: c.fundo, color: c.tinta } as CSSProperties}
      className="grid min-h-svh grid-cols-[minmax(0,1fr)] gap-y-8 overflow-hidden px-4 pt-5 pb-3 [grid-template-areas:'topo'_'logo'_'nome'_'acoes'] md:grid-cols-12 md:gap-x-8 md:px-8 md:pt-7 md:[grid-template-areas:'topo_topo_topo_topo_topo_topo_topo_topo_topo_topo_topo_topo'_'logo_logo_logo_logo_logo_._._acoes_acoes_acoes_acoes_acoes'_'nome_nome_nome_nome_nome_nome_nome_nome_nome_nome_nome_nome']"
    >
      <Topo d={d} t={t} className="[grid-area:topo]" />
      <div className="h-36 self-center [grid-area:logo] md:h-[44svh]">
        {d.logo ? (
          <ImagemCapa d={{ ...d, foto: null }} className="justify-start p-0" pintaFundo={false} />
        ) : null}
      </div>
      <div className="grid content-end gap-4 self-end [grid-area:acoes]">
        <AcaoPrincipal d={d} t={t} c={c} />
        <AcoesSecundarias d={d} t={t} />
      </div>
      <NomeMonumento nome={d.nome} estilo={d.estilo} className="self-end [grid-area:nome]" />
    </header>
  );
}
