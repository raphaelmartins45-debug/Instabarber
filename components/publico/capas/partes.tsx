import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { CoresCapa } from "@/lib/publico/cores-capa";
import type { Estilo } from "@/lib/publico/estilos";
import { cn } from "@/lib/utils";
import { LogoCapa } from "../logo-capa";

// Peças comuns às capas dos modelos (D-198): os dados, as ações e a imagem.

export type DadosCapa = {
  nome: string;
  cidade: string | null;
  morada: string | null;
  cor: string;
  logo: string | null;
  /** A cor de fundo do logótipo, guardada ao carregá-lo. */
  logoFundo: string | null;
  /** A fotografia da fachada, se a barbearia a tiver. */
  foto: string | null;
  estilo: Estilo;
  aberta: boolean;
  marcar: string;
  /** «Hoje, 15:30»: a próxima vaga real, ou nulo. */
  vaga: string | null;
  whatsapp: string | null;
  telefone: string | null;
  estado: string;
  entrar: string;
  /** Os serviços com preço já formatado, para o modelo Vitrine. */
  servicos: { id: string; nome: string; preco: string; duracao: string }[];
};

export type PropsCapa = { d: DadosCapa; t: TextosPublicos; c: CoresCapa };

/** A morada numa linha: «Rua…, 20 · Viseu». */
export const linhaMorada = (d: DadosCapa) => [d.morada, d.cidade].filter(Boolean).join(" · ");

/** O botão principal (marcar), com a próxima vaga por cima; ou o aviso de marcações fechadas. */
export function AcaoPrincipal({
  d,
  t,
  c,
  className,
  vagaClasse = "text-4xl md:text-5xl",
}: PropsCapa & { className?: string; vagaClasse?: string }) {
  return (
    <div className={cn("grid gap-4", className)}>
      {d.aberta && d.vaga ? (
        <p className="grid gap-1" data-testid="proxima-vaga">
          <span className="text-sm opacity-75">{t.capa.proximaVaga}</span>
          <span className={cn("titulo-estilo", vagaClasse)}>{d.vaga}</span>
        </p>
      ) : null}
      {d.aberta ? (
        <Link
          href={d.marcar}
          data-testid="acao-marcar"
          className="flex h-16 items-center justify-between gap-4 px-6 text-lg font-semibold transition-[filter] hover:brightness-110 active:translate-y-px"
          style={{ backgroundColor: c.destaque, color: c.tintaDestaque }}
        >
          {t.capa.marcarAgora}
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      ) : (
        <p
          className="px-5 py-4 font-semibold"
          style={{ backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)" }}
          data-testid="marcacoes-indisponiveis"
        >
          {t.capa.indisponivel}
        </p>
      )}
    </div>
  );
}

/** WhatsApp e chamada, um tom abaixo da ação principal, e o estado do momento. */
export function AcoesSecundarias({ d, t }: Omit<PropsCapa, "c">) {
  const classe =
    "flex h-14 items-center justify-center gap-2 px-4 text-sm font-semibold transition-opacity hover:opacity-80";
  const tom = { backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)" };
  return (
    <div className="grid gap-3">
      {d.whatsapp || d.telefone ? (
        <div className="grid grid-cols-2 gap-2">
          {d.whatsapp ? (
            <a
              href={d.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={classe}
              style={tom}
            >
              <MessageCircle aria-hidden className="size-4" />
              {t.capa.falarAjuda}
            </a>
          ) : null}
          {d.telefone ? (
            <a href={`tel:${d.telefone}`} className={classe} style={tom}>
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
  );
}

/** A linha de topo: a morada e «Entrar». */
export function Topo({ d, t, className }: Omit<PropsCapa, "c"> & { className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <p className="text-sm font-medium opacity-80">{linhaMorada(d)}</p>
      <Link
        href={d.entrar}
        className="shrink-0 text-sm font-semibold underline-offset-4 hover:underline"
      >
        {t.capa.entrar}
      </Link>
    </div>
  );
}

/**
 * A imagem da capa: a fotografia da fachada, se existir; senão o logótipo sobre a cor do fundo
 * dele (sem moldura); senão nada. `cobrir` faz a fotografia ocupar a caixa toda.
 */
export function ImagemCapa({ d, className }: { d: DadosCapa; className?: string }) {
  if (d.foto)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
      <img
        src={d.foto}
        alt={d.nome}
        className={cn("size-full object-cover", className)}
        fetchPriority="high"
      />
    );
  if (!d.logo) return null;
  return (
    <div
      data-fundo-logo
      className={cn("flex size-full items-center justify-center p-[8%]", className)}
      style={{ backgroundColor: d.logoFundo ?? d.cor }}
    >
      <LogoCapa nome={d.nome} logo={d.logo} fundoGuardado={!!d.logoFundo} />
    </div>
  );
}
