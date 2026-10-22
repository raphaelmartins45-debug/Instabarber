import Link from "next/link";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import {
  funcionalidadesLigadas,
  listarClubesPublicos,
  listarProdutosPublicos,
} from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { Bloco } from "./blocos";

/**
 * Clube, loja e cartões oferta na página pública (F.4.2, F.4.4, F.4.9). Tudo se paga ao balcão;
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
  const [produtos, clubes, ligadas] = await Promise.all([
    listarProdutosPublicos(bd, inquilinoId),
    listarClubesPublicos(bd, inquilinoId),
    funcionalidadesLigadas(bd, inquilinoId, ["cartoes_oferta"]),
  ]);
  const b = t.blocos;
  return (
    <>
      {clubes.length ? (
        <Bloco id="clube" titulo={b.clube}>
          <p className="text-sm text-muted-foreground">{b.clubeNota}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {clubes.map((c) => (
              <li key={c.id} className="grid gap-1 rounded-xl border bg-card p-4">
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
                  {p.esgotado ? b.esgotado : formatarDinheiro(p.precoCent)}
                </span>
              </li>
            ))}
          </ul>
          {produtos.some((p) => !p.esgotado) ? (
            <Link
              href={encomendar}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-foreground px-5 font-bold text-background sm:justify-self-start"
              data-testid="encomendar"
            >
              {b.encomendar}
            </Link>
          ) : null}
        </Bloco>
      ) : null}
      {ligadas.has("cartoes_oferta") ? (
        <Bloco id="cartoes" titulo={b.cartoes}>
          <p className="text-sm text-muted-foreground">{b.cartoesNota}</p>
        </Bloco>
      ) : null}
    </>
  );
}
