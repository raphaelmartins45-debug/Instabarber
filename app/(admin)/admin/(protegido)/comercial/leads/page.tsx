import Link from "next/link";
import { ApagarInativos } from "@/components/admin/comercial/apagar-inativos";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { Button } from "@/components/ui/button";
import { dataCurta, hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { acaoVencida, leadIncompleto } from "@/lib/regras/comercial";
import { type LeadLinha, listarLeads } from "@/lib/repositorios/comercial/leads";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";

const t = textos.comercial;
export const metadata = { title: `${t.separadores.leads} · ${t.titulo}` };

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Leads (N.3): pesquisa, filtro por estado e a aba «Incompletos» do formulário do site (D-50). */
export default async function Leads({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; vista?: string }>;
}) {
  const { q = "", estado = "", vista = "todos" } = await searchParams;
  const hoje = hojeIso();
  const busca = normalizar(q.trim());
  const leads = (await listarLeads(await criarClienteServidor())).filter(
    (l) =>
      (vista !== "incompletos" || leadIncompleto({ origem: l.origem, temPasso2: l.temPasso2 })) &&
      (!estado || l.estado === estado) &&
      (!busca ||
        normalizar(
          [l.nome_contacto, l.nome_barbearia, l.cidade, l.telefone, l.email].join(" "),
        ).includes(busca)),
  );
  const colunas: Coluna<LeadLinha>[] = [
    {
      id: "contacto",
      rotulo: t.leads.colunas.contacto,
      valor: (l) => (
        <Link
          href={`/admin/comercial/leads/${l.id}`}
          className="font-semibold text-ligacao underline"
        >
          {l.nome_contacto}
        </Link>
      ),
    },
    {
      id: "barbearia",
      rotulo: t.leads.colunas.barbearia,
      valor: (l) => l.nome_barbearia ?? textos.comum.vazio,
    },
    {
      id: "estado",
      rotulo: t.leads.colunas.estado,
      valor: (l) => (
        <Etiqueta
          tom={l.estado === "ganho" ? "sucesso" : l.estado === "perdido" ? "neutro" : "info"}
        >
          {t.estados[l.estado]}
        </Etiqueta>
      ),
    },
    { id: "origem", rotulo: t.leads.colunas.origem, valor: (l) => t.origens[l.origem] },
    {
      id: "proxima",
      rotulo: t.leads.colunas.proxima,
      valor: (l) =>
        l.proxima_acao ? (
          <span className={cn(acaoVencida(l.proxima_acao_em, hoje) && "text-destructive")}>
            {l.proxima_acao}
            {l.proxima_acao_em ? ` · ${dataCurta(`${l.proxima_acao_em}T12:00:00Z`)}` : ""}
          </span>
        ) : (
          <span className="text-terciario">{t.leads.semAcao}</span>
        ),
    },
    { id: "ultimo", rotulo: t.leads.colunas.ultimo, valor: (l) => dataCurta(l.ultimo_contacto_em) },
  ];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1" aria-label={t.separadores.leads}>
          {(["todos", "incompletos"] as const).map((v) => (
            <Link
              key={v}
              href={
                v === "todos"
                  ? "/admin/comercial/leads"
                  : "/admin/comercial/leads?vista=incompletos"
              }
              aria-current={vista === v ? "page" : undefined}
              className={cn(
                "flex h-9 items-center rounded-lg border px-3 text-sm",
                vista === v
                  ? "border-primary bg-accent font-semibold"
                  : "border-border text-muted-foreground",
              )}
            >
              {t.leads.vistas[v]}
            </Link>
          ))}
        </nav>
        <Button asChild>
          <Link href="/admin/comercial/leads/novo">{t.leads.novo}</Link>
        </Button>
      </div>
      {vista === "incompletos" ? (
        <p className="text-sm text-muted-foreground">{t.leads.incompletosAjuda}</p>
      ) : null}
      <form className="cartao flex flex-wrap items-end gap-3 rounded-2xl p-4">
        <input type="hidden" name="vista" value={vista} />
        <label className="grid min-w-56 flex-1 gap-1.5">
          <span className="rotulo">{t.leads.pesquisar}</span>
          <input
            name="q"
            defaultValue={q}
            className="h-11 rounded-lg border border-input bg-foreground/[.03] px-3 text-sm"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="rotulo">{t.leads.colunas.estado}</span>
          <select
            name="estado"
            defaultValue={estado}
            className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="">{t.leads.todos}</option>
            {Object.entries(t.estados).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" className="h-11">
          {t.leads.filtrar}
        </Button>
      </form>
      <TabelaCartoes
        colunas={colunas}
        linhas={leads}
        chave={(l) => l.id}
        vazio={t.leads.vazio}
        testId="lead"
      />
      <ApagarInativos />
    </div>
  );
}
