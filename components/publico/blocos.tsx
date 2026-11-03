import Link from "next/link";
import type { ReactNode } from "react";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { ProfissionalPublico, PromocaoPublica } from "@/lib/repositorios/barbearias-publicas";

// Blocos por baixo da capa (E.6): cada um só aparece com conteúdo e com a funcionalidade ativa.

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
    <section id={id} aria-labelledby={`${id}-titulo`} className="grid gap-8 py-16 md:py-24">
      {/* O título na letra do estilo da barbearia (D-198). */}
      <h2 id={`${id}-titulo`} className="titulo-estilo text-5xl md:text-7xl">
        {titulo}
      </h2>
      {children}
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
}: {
  t: TextosPublicos;
  servicos: ServicoPagina[];
  marcar: string | null;
}) {
  if (servicos.length === 0) return null;
  return (
    <Bloco id="servicos" titulo={t.blocos.servicos}>
      {/* A tabela de preços da casa (D-198): uma faixa por serviço, o preço à direita. */}
      <ul className="grid gap-1.5">
        {servicos.map((s) => {
          const conteudo = (
            <>
              <span className="grid gap-0.5">
                <span className="text-lg font-semibold">{s.nome}</span>
                <span className="text-sm text-muted-foreground">
                  {t.blocos.minutos(s.duracao)}
                  {s.descricao ? ` · ${s.descricao}` : ""}
                </span>
              </span>
              <span className="titulo-estilo text-3xl tabular-nums md:text-4xl">
                {formatarDinheiro(s.precoCent)}
              </span>
            </>
          );
          const faixa =
            "flex min-h-20 items-center justify-between gap-4 bg-muted px-5 py-4 md:px-7";
          return (
            <li key={s.id}>
              {marcar ? (
                <Link
                  href={`${marcar}?servico=${s.id}`}
                  className={`${faixa} transition-colors hover:bg-accent`}
                  data-testid="servico-publico"
                >
                  {conteudo}
                </Link>
              ) : (
                <div className={faixa}>{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
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
      <ul className="grid gap-2">
        {promocoes.map((p) => (
          <li key={p.id} className="grid gap-1 bg-accent px-5 py-5 md:px-7">
            <p className="text-xl font-bold">{p.titulo}</p>
            {p.descricao ? <p>{p.descricao}</p> : null}
          </li>
        ))}
      </ul>
    </Bloco>
  );
}

export function BlocoEquipa({ t, equipa }: { t: TextosPublicos; equipa: ProfissionalPublico[] }) {
  if (equipa.length === 0) return null;
  return (
    <Bloco id="equipa" titulo={t.blocos.barbeiros}>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
        {equipa.map((p) => (
          <li key={p.id} className="grid content-start gap-3">
            {p.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
              <img
                src={p.fotoUrl}
                alt=""
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <span className="titulo-estilo grid aspect-[4/5] w-full place-items-center bg-muted text-7xl">
                {p.nome[0]}
              </span>
            )}
            <span className="titulo-estilo text-2xl md:text-3xl" translate="no">
              {p.nome}
            </span>
            {p.portfolio.length ? (
              <div aria-label={t.blocos.trabalhos(p.nome)} className="grid grid-cols-3 gap-1">
                {p.portfolio.slice(0, 6).map((f) => (
                  // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
                  <img
                    key={f}
                    src={f}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Bloco>
  );
}
