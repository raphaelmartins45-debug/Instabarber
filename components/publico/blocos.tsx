import Link from "next/link";
import type { ReactNode } from "react";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type {
  ProdutoPublico,
  ProfissionalPublico,
  PromocaoPublica,
} from "@/lib/repositorios/barbearias-publicas";

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
    <section id={id} aria-labelledby={`${id}-titulo`} className="grid gap-4 py-8">
      <h2 id={`${id}-titulo`} className="text-xl font-extrabold">
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
      <ul className="grid gap-2 sm:grid-cols-2">
        {servicos.map((s) => {
          const conteudo = (
            <>
              <span className="flex justify-between gap-3">
                <span className="font-bold">{s.nome}</span>
                <span className="font-bold tabular-nums">{formatarDinheiro(s.precoCent)}</span>
              </span>
              <span className="text-sm text-muted-foreground">
                {t.blocos.minutos(s.duracao)}
                {s.descricao ? ` · ${s.descricao}` : ""}
              </span>
            </>
          );
          return (
            <li key={s.id}>
              {marcar ? (
                <Link
                  href={`${marcar}?servico=${s.id}`}
                  className="grid min-h-16 gap-1 rounded-xl border bg-card p-4 hover:bg-muted"
                  data-testid="servico-publico"
                >
                  {conteudo}
                </Link>
              ) : (
                <div className="grid gap-1 rounded-xl border bg-card p-4">{conteudo}</div>
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
          <li key={p.id} className="rounded-xl border border-destaque/40 bg-accent p-4">
            <p className="font-bold">{p.titulo}</p>
            {p.descricao ? <p className="text-sm">{p.descricao}</p> : null}
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
      <ul className="grid gap-4 sm:grid-cols-2">
        {equipa.map((p) => (
          <li key={p.id} className="grid gap-3 rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              {p.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
                <img src={p.fotoUrl} alt="" className="size-14 rounded-full border object-cover" />
              ) : (
                <span className="grid size-14 place-items-center rounded-full bg-muted text-lg font-bold">
                  {p.nome[0]}
                </span>
              )}
              <span className="font-bold">{p.nome}</span>
            </div>
            {p.portfolio.length ? (
              <div aria-label={t.blocos.trabalhos(p.nome)} className="grid grid-cols-3 gap-2">
                {p.portfolio.slice(0, 6).map((f) => (
                  // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
                  <img
                    key={f}
                    src={f}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded-md object-cover"
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

export function BlocoLoja({ t, produtos }: { t: TextosPublicos; produtos: ProdutoPublico[] }) {
  if (produtos.length === 0) return null;
  return (
    <Bloco id="loja" titulo={t.blocos.loja}>
      <p className="text-sm text-muted-foreground">{t.blocos.lojaNota}</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {produtos.map((p) => (
          <li key={p.id} className="grid gap-2 rounded-xl border bg-card p-3">
            {p.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
              <img
                src={p.fotoUrl}
                alt=""
                loading="lazy"
                className="aspect-square w-full rounded-md object-cover"
              />
            ) : null}
            <span className="font-semibold">{p.nome}</span>
            <span className="text-sm">
              {p.esgotado ? t.blocos.esgotado : formatarDinheiro(p.precoCent)}
            </span>
          </li>
        ))}
      </ul>
    </Bloco>
  );
}
