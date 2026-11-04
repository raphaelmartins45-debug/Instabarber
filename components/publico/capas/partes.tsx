import { ArrowRight, MessageCircle, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { CoresCapa } from "@/lib/publico/cores-capa";
import type { Estilo } from "@/lib/publico/estilos";
import { cn } from "@/lib/utils";

// Peças comuns aos cabeçalhos dos modelos (D-198, D-200, D-201): os dados, o logótipo, o nome, as
// informações e as ações. Tamanhos contidos: o nome é um título, não um cartaz.

export type DadosCapa = {
  nome: string;
  cidade: string | null;
  morada: string | null;
  /** A cor do cabeçalho, escolhida pela barbearia. */
  cor: string;
  logo: string | null;
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
  /** Os serviços com preço já formatado, para o cabeçalho Montra. */
  servicos: { id: string; nome: string; preco: string; duracao: string }[];
};

export type PropsCapa = { d: DadosCapa; t: TextosPublicos; c: CoresCapa };

/** O fundo e o texto do cabeçalho, e as cores do botão para as peças lá dentro. */
export const corDoCabecalho = (c: CoresCapa): CSSProperties =>
  ({
    backgroundColor: c.fundo,
    color: c.tinta,
    "--capa-destaque": c.destaque,
    "--capa-tinta-destaque": c.tintaDestaque,
  }) as CSSProperties;

/** A morada numa linha: «Rua…, 20 · Viseu». */
export const linhaMorada = (d: DadosCapa) => [d.morada, d.cidade].filter(Boolean).join(" · ");

/** O logótipo tal como é, sem moldura, sobre a cor do cabeçalho escolhida pela barbearia. */
export function Logo({ d, className }: { d: DadosCapa; className?: string }) {
  if (!d.logo) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage, sem otimizador
    <img
      src={d.logo}
      alt={d.nome}
      className={cn("max-h-full max-w-full object-contain", className)}
      fetchPriority="high"
    />
  );
}

export function Nome({ d, className }: { d: DadosCapa; className?: string }) {
  return (
    <h1 className={cn("titulo-estilo text-4xl md:text-5xl", className)} translate="no">
      {d.nome}
    </h1>
  );
}

/** A morada e o estado do momento («Aberto agora · fecha às 19:30»). */
export function Info({ d, className }: { d: DadosCapa; className?: string }) {
  const morada = linhaMorada(d);
  return (
    <div className={cn("grid gap-1.5 text-sm", className)}>
      {morada ? <p className="opacity-80">{morada}</p> : null}
      <p className="flex items-center gap-2 font-semibold">
        <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
        {d.estado}
      </p>
    </div>
  );
}

/** «Entrar», no canto do cabeçalho: um botão com o contorno na cor do texto do cabeçalho. */
export function Entrar({ d, t, className }: Omit<PropsCapa, "c"> & { className?: string }) {
  return (
    <Link
      href={d.entrar}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-[var(--raio-botao)] border border-current/35 px-4 text-sm font-semibold transition-colors hover:bg-current/10",
        className,
      )}
    >
      <UserRound aria-hidden className="size-4" />
      {t.capa.entrar}
    </Link>
  );
}

/**
 * Marcar (com a próxima vaga), WhatsApp e chamada. `tom="capa"` usa as cores do cabeçalho;
 * `tom="corpo"` as do corpo claro (para as peças em cartão branco).
 */
export function Acoes({
  d,
  t,
  tom = "capa",
  centro,
  className,
}: Omit<PropsCapa, "c"> & { tom?: "capa" | "corpo"; centro?: boolean; className?: string }) {
  const principal: CSSProperties =
    tom === "capa"
      ? { backgroundColor: "var(--capa-destaque)", color: "var(--capa-tinta-destaque)" }
      : { backgroundColor: "var(--ac)", color: "var(--ac-sobre)" };
  const botao =
    "inline-flex h-12 items-center justify-center gap-2 rounded-[var(--raio-botao)] px-5 text-sm font-semibold transition-[filter,opacity] active:translate-y-px";
  const secundario = cn(
    botao,
    "px-3 whitespace-nowrap sm:px-5",
    "border hover:opacity-80",
    tom === "capa" ? "border-current/30" : "border-borda-forte bg-card",
  );
  return (
    <div className={cn("grid gap-3", centro && "justify-items-center", className)}>
      {d.aberta && d.vaga ? (
        <p className="text-sm" data-testid="proxima-vaga">
          <span className="opacity-75">{t.capa.proximaVaga} · </span>
          <span className="font-semibold">{d.vaga}</span>
        </p>
      ) : null}
      <div
        className={cn(
          "grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap",
          centro && "sm:justify-center",
        )}
      >
        {d.aberta ? (
          <Link
            href={d.marcar}
            data-testid="acao-marcar"
            className={cn(botao, "px-6 hover:brightness-110")}
            style={principal}
          >
            {t.capa.marcarAgora}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        ) : (
          <p
            className={cn(botao, "border border-current/30")}
            data-testid="marcacoes-indisponiveis"
          >
            {t.capa.indisponivel}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {d.whatsapp ? (
            <a href={d.whatsapp} target="_blank" rel="noopener noreferrer" className={secundario}>
              <MessageCircle aria-hidden className="size-4" />
              {t.capa.falarAjuda}
            </a>
          ) : null}
          {d.telefone ? (
            <a href={`tel:${d.telefone}`} className={secundario}>
              <Phone aria-hidden className="size-4" />
              {formatarTelefone(d.telefone)}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * A imagem grande do cabeçalho Painel: a fotografia da fachada, se existir; senão o logótipo
 * sobre a cor do fundo dele.
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
  return (
    <div className={cn("flex size-full items-center justify-center p-[10%]", className)}>
      <Logo d={d} className="max-h-40 md:max-h-72" />
    </div>
  );
}
