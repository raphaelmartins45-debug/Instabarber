import type { TextosPublicos } from "@/lib/i18n/publico";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import type { Estilo } from "@/lib/publico/estilos";
import { CapaAnuario } from "./anuario";
import { CapaBairro } from "./bairro";
import { CapaCartao } from "./cartao";
import { CapaCartaz } from "./cartaz";
import { CapaMonumento } from "./monumento";
import { CapaPalco } from "./palco";
import type { DadosCapa, PropsCapa } from "./partes";
import { CapaSalaEscura } from "./sala-escura";
import { CapaVitrine } from "./vitrine";

export type { DadosCapa } from "./partes";

// A capa de cada modelo (D-198). As cores partem sempre da barbearia; o fundo de onde se calcula
// o botão é o do logótipo, ou o papel, ou o escuro, conforme o modelo.

const CAPAS: Record<Estilo, (p: PropsCapa) => React.ReactNode> = {
  monumento: CapaMonumento,
  sala_escura: CapaSalaEscura,
  cartaz: CapaCartaz,
  cartao: CapaCartao,
  palco: CapaPalco,
  bairro: CapaBairro,
  anuario: CapaAnuario,
  vitrine: CapaVitrine,
};

const FUNDO_FIXO: Partial<Record<Estilo, string>> = {
  sala_escura: "#0F0E0D",
  palco: "#141210",
  vitrine: "#F6F3EE",
};

export function CapaDoModelo({ d, t }: { d: DadosCapa; t: TextosPublicos }) {
  const Capa = CAPAS[d.estilo];
  const c = coresDaCapa(d.cor, FUNDO_FIXO[d.estilo] ?? d.logoFundo);
  return <Capa d={d} t={t} c={c} />;
}
