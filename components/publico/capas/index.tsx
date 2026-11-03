import type { TextosPublicos } from "@/lib/i18n/publico";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import { MODELOS, type Modelo } from "@/lib/publico/estilos";
import { CabecalhoCartao, CabecalhoMontra, CabecalhoPainel } from "./compostos";
import type { DadosCapa, PropsCapa } from "./partes";
import { CabecalhoCentrado, CabecalhoDividido, CabecalhoFaixa } from "./simples";

export type { DadosCapa } from "./partes";

// O cabeçalho de cada modelo (D-200): a cor é a do fundo do logótipo (ou a da barbearia), e o
// modelo só decide a arrumação.

const CABECALHOS: Record<Modelo["cabecalho"], (p: PropsCapa) => React.ReactNode> = {
  centrado: CabecalhoCentrado,
  dividido: CabecalhoDividido,
  faixa: CabecalhoFaixa,
  cartao: CabecalhoCartao,
  painel: CabecalhoPainel,
  montra: CabecalhoMontra,
};

export function CapaDoModelo({ d, t }: { d: DadosCapa; t: TextosPublicos }) {
  const Cabecalho = CABECALHOS[MODELOS[d.estilo].cabecalho];
  return <Cabecalho d={d} t={t} c={coresDaCapa(d.cor, d.logoFundo)} />;
}
