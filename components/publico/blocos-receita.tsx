import { Package } from "lucide-react";
import Link from "next/link";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import {
  listarClubesPublicos,
  listarProdutosPublicos,
} from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { Bloco, CARTAO } from "./blocos";

/**
 * Clube e loja na página pública (F.4.2, F.4.4); o cartão oferta fica no fim (D-206). Tudo se paga ao balcão;
 * cada bloco só aparece com a funcionalidade ligada e com conteúdo.
 */
export async function BlocosReceita({
  t,
  inquilinoId,
  encomendar,
}: {
  t: TextosPublicos;
  inquilinoId: string;
  encomendar: string;
}) {
  const bd = await criarClienteServidor();
  const [produtos, clubes] = await Promise.all([
    listarProdutosPublicos(bd, inquilinoId),
    listarClubesPublicos(bd, inquilinoId),
  ]);
  const b = t.blocos;
  return (
    <>
      {clubes.length ? (
        <Bloco id="clube" titulo={b.clube}>
          <p className="text-sm text-muted-foreground">{b.clubeNota}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {clubes.map((c) => (
              <li key={c.id} className="grid gap-1 rounded-[var(--raio)] border bg-card p-4">
                <span className="font-bold">{c.nome}</span>
                <span className="text-lg font-extrabold">
                  {b.porMes(formatarDinheiro(c.precoCent))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {c.servicos.map((s) => b.incluido(s.quantidade, s.servico)).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </Bloco>
      ) : null}
      {produtos.length ? (
        <Bloco id="loja" titulo={b.loja}>
          <p className="text-sm text-muted-foreground">{b.lojaNota}</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p) => (
              <li key={p.id} className={p.esgotado ? "opacity-60" : undefined}>
                <Link
                  href={encomendar}
                  className={`${CARTAO} grid h-full content-start overflow-hidden transition-colors hover:border-primary/60`}
                  data-testid="produto-inicio"
                >
                  <span className="relative grid aspect-square place-items-center bg-muted text-muted-foreground">
                    {p.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
                      <img
                        src={p.fotoUrl}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Package aria-hidden className="size-8" />
                    )}
                    {p.esgotado ? (
                      <span className="absolute top-2 left-2 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-card-foreground">
                        {b.esgotado}
                      </span>
                    ) : null}
                  </span>
                  <span className="grid gap-0.5 p-3">
                    <span className="truncate text-sm font-semibold">{p.nome}</span>
                    <span className="numero text-base font-bold">
                      {formatarDinheiro(p.precoCent)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {produtos.some((p) => !p.esgotado) ? (
            <Link
              href={encomendar}
              className="inline-flex h-12 items-center justify-center rounded-[var(--raio-botao)] bg-primary px-5 font-bold text-primary-foreground sm:justify-self-start"
              data-testid="encomendar"
            >
              {b.verLoja}
            </Link>
          ) : null}
        </Bloco>
      ) : null}
    </>
  );
}
