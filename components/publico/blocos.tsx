import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { Modelo } from "@/lib/publico/estilos";
import type { PromocaoPublica } from "@/lib/repositorios/barbearias-publicas";

// Blocos por baixo do cabeçalho (E.6, D-200): cada um só aparece com conteúdo e com a
// funcionalidade ativa. O conteúdo vai em cartões brancos sobre o fundo claro; o título é um
// título de secção, não um cartaz. No corpo editorial, o título fica à esquerda; na lateral,
// os blocos ficam compactos.

/** O cartão branco dos blocos, com o raio do modelo. */
export const CARTAO = "cartao-modelo rounded-[var(--raio)] border bg-card text-card-foreground";

export function Bloco({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className="grid scroll-mt-20 content-start gap-4 py-8 in-data-[lateral]:py-0 md:gap-5 md:py-10 md:in-data-[lateral]:py-0 md:in-data-[corpo=editorial]:grid-cols-[12rem_minmax(0,1fr)] md:in-data-[corpo=editorial]:gap-10 md:in-data-[lateral]:grid-cols-1"
    >
      <h2
        id={`${id}-titulo`}
        className="titulo-estilo text-2xl in-data-[lateral]:text-xl md:text-3xl md:in-data-[lateral]:text-xl"
      >
        {titulo}
      </h2>
      <div className="grid min-w-0 content-start gap-4">{children}</div>
    </section>
  );
}

export type ServicoPagina = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao: number;
  precoCent: number;
};

export function BlocoServicos({
  t,
  servicos,
  marcar,
  modo,
}: {
  t: TextosPublicos;
  servicos: ServicoPagina[];
  marcar: string | null;
  modo: Modelo["servicos"];
}) {
  if (servicos.length === 0) return null;
  const meta = (s: ServicoPagina) =>
    `${t.blocos.minutos(s.duracao)}${s.descricao ? ` · ${s.descricao}` : ""}`;
  const ligar = (s: ServicoPagina, classe: string, conteudo: ReactNode) =>
    marcar ? (
      <Link
        href={`${marcar}?servico=${s.id}`}
        className={`${classe} transition-colors hover:bg-campo`}
        data-testid="servico-publico"
      >
        {conteudo}
      </Link>
    ) : (
      <div className={classe}>{conteudo}</div>
    );
  return (
    <Bloco id="servicos" titulo={t.blocos.servicos}>
      {modo === "lista" ? (
        <ul className={`${CARTAO} divide-y overflow-hidden`}>
          {servicos.map((s) => (
            <li key={s.id}>
              {ligar(
                s,
                "flex min-h-16 items-center gap-4 px-4 py-3.5 md:px-6",
                <>
                  <span className="grid flex-1 gap-0.5">
                    <span className="font-semibold">{s.nome}</span>
                    <span className="text-sm text-muted-foreground">{meta(s)}</span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatarDinheiro(s.precoCent)}
                  </span>
                  {marcar ? (
                    <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
                  ) : null}
                </>,
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {servicos.map((s) => (
            <li key={s.id} className={`${CARTAO} overflow-hidden`}>
              {ligar(
                s,
                "grid h-full content-between gap-4 p-5",
                <>
                  <span className="grid gap-1">
                    <span className="text-lg font-semibold">{s.nome}</span>
                    <span className="text-sm text-muted-foreground">{meta(s)}</span>
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold">{formatarDinheiro(s.precoCent)}</span>
                    {marcar ? (
                      <span className="flex items-center gap-1 text-sm font-semibold">
                        {t.capa.marcarCurto}
                        <ArrowRight aria-hidden className="size-4" />
                      </span>
                    ) : null}
                  </span>
                </>,
              )}
            </li>
          ))}
        </ul>
      )}
    </Bloco>
  );
}

export function BlocoPromocoes({
  t,
  promocoes,
}: {
  t: TextosPublicos;
  promocoes: PromocaoPublica[];
}) {
  if (promocoes.length === 0) return null;
  return (
    <Bloco id="promocoes" titulo={t.blocos.promocoes}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {promocoes.map((p) => (
          <li key={p.id} className={`${CARTAO} grid content-start gap-1 bg-accent p-5`}>
            <p className="text-lg font-semibold">{p.titulo}</p>
            {p.descricao ? <p className="text-muted-foreground">{p.descricao}</p> : null}
          </li>
        ))}
      </ul>
    </Bloco>
  );
}
