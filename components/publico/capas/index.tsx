import type { TextosPublicos } from "@/lib/i18n/publico";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import { MODELOS, type Modelo } from "@/lib/publico/estilos";
import { CabecalhoCartao, CabecalhoMontra, CabecalhoPainel } from "./compostos";
import { CabecalhoDestaque, CabecalhoLoja } from "./especiais";
import type { DadosCapa, PropsCapa } from "./partes";
import { CabecalhoCentrado, CabecalhoDividido, CabecalhoFaixa } from "./simples";

export type { DadosCapa } from "./partes";

// O cabeçalho de cada modelo (D-200, D-201): o fundo é a cor escolhida pela barbearia, onde o
// logótipo casa melhor; o botão tem o destaque do modelo; o modelo decide a arrumação.

const CABECALHOS: Record<Modelo["cabecalho"], (p: PropsCapa) => React.ReactNode> = {
  centrado: CabecalhoCentrado,
  dividido: CabecalhoDividido,
  faixa: CabecalhoFaixa,
  cartao: CabecalhoCartao,
  painel: CabecalhoPainel,
  montra: CabecalhoMontra,
  destaque: CabecalhoDestaque,
  loja: CabecalhoLoja,
};

export function CapaDoModelo({ d, t }: { d: DadosCapa; t: TextosPublicos }) {
  const Cabecalho = CABECALHOS[MODELOS[d.estilo].cabecalho];
  return <Cabecalho d={d} t={t} c={coresDaCapa(MODELOS[d.estilo].paleta.destaque, d.cor)} />;
}
