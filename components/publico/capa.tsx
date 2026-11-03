import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { coresDaCapa } from "@/lib/publico/cores-capa";
import type { Estilo } from "@/lib/publico/estilos";
import { cn } from "@/lib/utils";
import { LETRA_DO_ESTILO } from "./fontes";
import { LogoCapa } from "./logo-capa";
import { NomeMonumento } from "./nome-monumento";

export type DadosCapa = {
  nome: string;
  cidade: string | null;
  morada: string | null;
  cor: string;
  logo: string | null;
  /** A cor de fundo do logótipo, guardada ao carregá-lo (D-198). */
  logoFundo: string | null;
  estilo: Estilo;
  aberta: boolean;
  marcar: string;
  /** «Hoje, 15:30»: a próxima vaga real (D-198), ou nulo. */
  vaga: string | null;
  whatsapp: string | null;
  telefone: string | null;
  estado: string;
  /** A entrada do cliente (D-180); a equipa entra por /gestor e /barbeiro. */
  entrar: string;
};

/**
 * A capa (E.6, D-198) é a primeira página da barbearia: o logótipo solto sobre a cor do fundo
 * dele, o nome como monumento de margem a margem, na letra do estilo, e uma só ação principal
 * (marcar), com a próxima vaga. WhatsApp e chamada ficam ao lado, num tom abaixo.
 */
export function Capa({ d, t }: { d: DadosCapa; t: TextosPublicos }) {
  const c = coresDaCapa(d.cor, d.logoFundo);
  const letra = LETRA_DO_ESTILO[d.estilo];
  const tom = { backgroundColor: "color-mix(in srgb, var(--capa-tinta) 12%, transparent)" };
  const secundaria =
    "flex h-14 items-center justify-center gap-2 px-4 text-sm font-semibold transition-opacity hover:opacity-80";
  return (
    <header
      id="capa"
      data-estilo={d.estilo}
      style={
        {
          "--capa-fundo": c.fundo,
          "--capa-tinta": c.tinta,
          backgroundColor: "var(--capa-fundo)",
          color: "var(--capa-tinta)",
        } as CSSProperties
      }
      className="grid min-h-svh grid-cols-[minmax(0,1fr)] gap-y-8 overflow-hidden px-4 pt-5 pb-3 [grid-template-areas:'topo'_'logo'_'nome'_'acoes'] md:grid-cols-12 md:gap-x-8 md:px-8 md:pt-7 md:[grid-template-areas:'topo_topo_topo_topo_topo_topo_topo_topo_topo_topo_topo_topo'_'logo_logo_logo_logo_logo_._._acoes_acoes_acoes_acoes_acoes'_'nome_nome_nome_nome_nome_nome_nome_nome_nome_nome_nome_nome']"
    >
      <div className="flex items-baseline justify-between gap-4 [grid-area:topo]">
        <p className="text-sm font-medium opacity-80">
          {[d.morada, d.cidade].filter(Boolean).join(" · ")}
        </p>
        <Link
          href={d.entrar}
          className="shrink-0 text-sm font-semibold underline-offset-4 hover:underline"
        >
          {t.capa.entrar}
        </Link>
      </div>
      <div className="self-center [grid-area:logo]">
        {d.logo ? <LogoCapa nome={d.nome} logo={d.logo} fundoGuardado={!!d.logoFundo} /> : null}
      </div>
      <div className="grid content-end gap-4 self-end [grid-area:acoes]">
        {d.aberta && d.vaga ? (
          <p className="grid gap-1" data-testid="proxima-vaga">
            <span className="text-sm opacity-75">{t.capa.proximaVaga}</span>
            <span className={cn(letra, "text-4xl leading-none md:text-5xl")}>{d.vaga}</span>
          </p>
        ) : null}
        {d.aberta ? (
          <Link
            href={d.marcar}
            data-testid="acao-marcar"
            className="flex h-16 items-center justify-between px-6 text-lg font-bold transition-[filter] hover:brightness-110 active:translate-y-px"
            style={{ backgroundColor: c.destaque, color: c.tintaDestaque }}
          >
            {t.capa.marcarAgora}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        ) : (
          <p className="px-5 py-4 font-bold" style={tom} data-testid="marcacoes-indisponiveis">
            {t.capa.indisponivel}
          </p>
        )}
        {d.whatsapp || d.telefone ? (
          <div className="grid grid-cols-2 gap-2">
            {d.whatsapp ? (
              <a
                href={d.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={secundaria}
                style={tom}
              >
                <MessageCircle aria-hidden className="size-4" />
                {t.capa.falarAjuda}
              </a>
            ) : null}
            {d.telefone ? (
              <a href={`tel:${d.telefone}`} className={secundaria} style={tom}>
                <Phone aria-hidden className="size-4" />
                {formatarTelefone(d.telefone)}
              </a>
            ) : null}
          </div>
        ) : null}
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden className="size-2 rounded-full bg-current" />
          {d.estado}
        </p>
      </div>
      <NomeMonumento nome={d.nome} estilo={d.estilo} className="[grid-area:nome] self-end" />
    </header>
  );
}
