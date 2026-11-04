import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Acoes,
  corDoCabecalho,
  Entrar,
  ImagemCapa,
  Info,
  Logo,
  Nome,
  type PropsCapa,
} from "./partes";

// Cabeçalhos compostos (D-200): a cor da marca encontra o corpo claro dentro do próprio
// cabeçalho. Cartão de visita, painel e montra.

const caixa = "mx-auto w-full max-w-6xl px-4 md:px-8";
const cartao = "cartao-modelo rounded-[var(--raio)] border bg-card text-card-foreground";

/** Uma faixa da marca com o logótipo e, a sobrepor-se a ela, um cartão de visita branco. */
export function CabecalhoCartao({ d, t, c }: PropsCapa) {
  return (
    <header id="capa">
      <div style={corDoCabecalho(c)}>
        <div className={`${caixa} grid justify-items-center gap-4 pt-3 pb-20 md:pb-24`}>
          <Entrar d={d} t={t} className="justify-self-end" />
          <Logo d={d} className="max-h-32 md:max-h-40" />
        </div>
      </div>
      <div className={`${caixa} -mt-14 md:-mt-16`}>
        <div
          className={cn(
            cartao,
            "mx-auto grid max-w-3xl justify-items-center gap-5 px-5 py-8 text-center md:px-10 md:py-10",
          )}
        >
          <div className="grid justify-items-center gap-3">
            <Nome d={d} />
            <Info d={d} className="justify-items-center text-muted-foreground" />
          </div>
          <Acoes d={d} t={t} tom="corpo" centro className="w-full" />
        </div>
      </div>
    </header>
  );
}

/** Metade na cor da marca com o logótipo (ou a fachada), metade clara com o nome e as ações. */
export function CabecalhoPainel({ d, t, c }: PropsCapa) {
  return (
    <header id="capa" className="grid md:min-h-[34rem] md:grid-cols-2">
      <div style={corDoCabecalho(c)} className="h-56 overflow-hidden md:h-auto">
        <ImagemCapa d={d} />
      </div>
      <div className="grid content-between gap-8 px-4 pt-3 pb-10 md:px-12 md:pb-12">
        <Entrar d={d} t={t} className="justify-self-end" />
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Nome d={d} className="md:text-6xl" />
            <Info d={d} className="text-muted-foreground" />
          </div>
          <Acoes d={d} t={t} tom="corpo" />
        </div>
      </div>
    </header>
  );
}

/** Na cor da marca, o nome e as ações à esquerda; à direita, a montra com os preços. */
export function CabecalhoMontra({ d, t, c }: PropsCapa) {
  const lista = d.servicos.slice(0, 5);
  return (
    <header id="capa" style={corDoCabecalho(c)}>
      <div className={`${caixa} grid gap-6 pt-3 pb-10 md:pb-14`}>
        <Entrar d={d} t={t} className="justify-self-end" />
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-14">
          <div className="grid gap-6">
            <Logo d={d} className="max-h-28 md:max-h-36" />
            <div className="grid gap-3">
              <Nome d={d} />
              <Info d={d} />
            </div>
            <Acoes d={d} t={t} />
          </div>
          {lista.length ? (
            <div className={cn(cartao, "hidden p-2 md:grid")}>
              <ul className="divide-y">
                {lista.map((s) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-4 px-4 py-3">
                    <span className="grid">
                      <span className="font-semibold">{s.nome}</span>
                      <span className="text-xs text-muted-foreground">{s.duracao}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{s.preco}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="#servicos"
                className="px-4 py-3 text-sm font-semibold underline-offset-4 hover:underline"
              >
                {t.blocos.verTodos}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
