"use client";

import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { encomendar } from "@/app/(publico)/b/[slug]/loja/acoes";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";
import type { ProdutoPublico } from "@/lib/repositorios/barbearias-publicas";
import { CartaoProduto } from "./cartao-produto";
import { EncomendaFeita } from "./encomenda-feita";
import { FolhaProduto } from "./folha-produto";
import { Saco, type LinhaSaco } from "./saco";

/**
 * A loja da página pública como uma pequena aplicação (F.4.4, D-205): montra em grelha, detalhe
 * em folha, saco sempre à vista (barra no fundo no telemóvel, painel ao lado no computador) e
 * fecho em três passos. Paga-se sempre ao balcão, no levantamento (CLAUDE.md §3).
 */
export function Montra({
  lingua,
  slug,
  produtos,
  cliente,
  voltar,
  marcar,
}: {
  lingua: Lingua;
  slug: string;
  produtos: ProdutoPublico[];
  cliente: { nome: string; telefone: string } | null;
  voltar: string;
  marcar: string | null;
}) {
  const t = textosPublicos(lingua);
  const l = t.loja;
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [aberto, setAberto] = useState<ProdutoPublico | null>(null);
  const [vista, setVista] = useState<"montra" | "saco" | "feita">("montra");
  const [feitas, setFeitas] = useState<LinhaSaco[]>([]);
  const [erro, setErro] = useState<string>();
  const [aEnviar, iniciar] = useTransition();
  const mudar = useCallback(
    (id: string, q: number) =>
      setQuantidades((x) => ({ ...x, [id]: Math.max(0, Math.min(20, q)) })),
    [],
  );
  const linhas: LinhaSaco[] = produtos
    .filter((p) => (quantidades[p.id] ?? 0) > 0)
    .map((p) => ({ produto: p, quantidade: quantidades[p.id]! }));
  const artigos = linhas.reduce((a, x) => a + x.quantidade, 0);
  // O total mostra-se para o cliente saber quanto paga; o que conta é o da base de dados.
  const total = (ls: LinhaSaco[]) => ls.reduce((a, x) => a + x.produto.precoCent * x.quantidade, 0);
  const fecharFolha = useCallback(() => setAberto(null), []);

  const enviar = (c: Parameters<Parameters<typeof Saco>[0]["aoEnviar"]>[0]) =>
    iniciar(async () => {
      if (!linhas.length) return setErro(l.vazio);
      const r = await encomendar(slug, {
        ...c,
        linhas: linhas.map((x) => ({ produtoId: x.produto.id, quantidade: x.quantidade })),
      });
      if (!r.ok) return setErro(t.marcacao.erros[r.erro] ?? t.marcacao.erros.erro);
      setFeitas(linhas);
      setQuantidades({});
      setVista("feita");
      window.scrollTo({ top: 0 });
    });

  if (vista === "feita")
    return (
      <EncomendaFeita
        t={t}
        linhas={feitas}
        totalCent={total(feitas)}
        marcar={marcar}
        voltar={voltar}
      />
    );

  const saco = (
    <Saco
      t={t}
      linhas={linhas}
      totalCent={total(linhas)}
      mudar={mudar}
      cliente={cliente}
      erro={erro}
      aEnviar={aEnviar}
      aoEnviar={enviar}
    />
  );

  // Telemóvel: o saco abre como um passo próprio, com o progresso em cima.
  if (vista === "saco")
    return (
      <div className="grid gap-4 md:hidden">
        <button
          type="button"
          onClick={() => setVista("montra")}
          className="inline-flex h-11 items-center gap-2 justify-self-start text-sm font-semibold"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {l.continuarComprar}
        </button>
        <div className="grid grid-cols-3 gap-1.5" aria-label={l.passo(2, 3)}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-1 rounded-full ${n <= 2 ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <h2 className="text-xl font-bold">{l.saco}</h2>
        {saco}
      </div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
      <section className="grid gap-4" aria-labelledby="loja-titulo">
        <div className="grid gap-1">
          <h2 id="loja-titulo" className="titulo-estilo text-2xl">
            {l.titulo}
          </h2>
          <p className="text-sm text-muted-foreground">{l.nota}</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {produtos.map((p) => (
            <CartaoProduto
              key={p.id}
              t={t}
              p={p}
              quantidade={quantidades[p.id] ?? 0}
              mudar={(q) => mudar(p.id, q)}
              abrir={() => setAberto(p)}
            />
          ))}
        </ul>
      </section>
      {/* Computador: o saco fica fixo ao lado da montra. */}
      <aside className="cartao-modelo hidden gap-3 rounded-[var(--raio)] border bg-card p-5 text-card-foreground md:sticky md:top-6 md:grid">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ShoppingBag aria-hidden className="size-5" />
          {l.saco}
        </h2>
        {saco}
      </aside>
      {/* Telemóvel: a barra do saco fica no fundo enquanto se escolhe. */}
      {artigos > 0 ? (
        <button
          type="button"
          onClick={() => {
            setVista("saco");
            window.scrollTo({ top: 0 });
          }}
          className="fixed inset-x-3 bottom-3 z-30 flex h-14 items-center justify-between gap-3 rounded-[var(--raio-botao)] bg-foreground pr-2 pl-5 font-semibold text-background shadow-lg animate-in slide-in-from-bottom duration-200 md:hidden"
          data-testid="barra-saco"
        >
          <span key={artigos} className="numero animate-in zoom-in-90 duration-150">
            {l.artigos(artigos)} · {formatarDinheiro(total(linhas))}
          </span>
          <span className="rounded-[var(--raio-botao)] bg-primary px-4 py-2.5 text-primary-foreground">
            {l.verSaco}
          </span>
        </button>
      ) : null}
      {aberto ? (
        <FolhaProduto
          t={t}
          p={aberto}
          quantidadeAtual={quantidades[aberto.id] ?? 0}
          aoFechar={fecharFolha}
          aoAdicionar={(q) => {
            mudar(aberto.id, q);
            setAberto(null);
          }}
        />
      ) : null}
    </div>
  );
}
