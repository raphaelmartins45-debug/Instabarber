import Link from "next/link";
import { ApagarInativos } from "@/components/admin/comercial/apagar-inativos";
import { FiltrosLeads } from "@/components/admin/comercial/filtros-leads";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { Button } from "@/components/ui/button";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { dataCurta, hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { acaoVencida, leadIncompleto } from "@/lib/regras/comercial";
import { listarComerciais } from "@/lib/repositorios/admin/equipa";
import { type LeadLinha, listarLeads } from "@/lib/repositorios/comercial/leads";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";

const t = textos.comercial;
export const metadata = { title: `${t.separadores.leads} · ${t.titulo}` };

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Leads (N.3): pesquisa, filtros e a aba «Incompletos» do formulário do site (D-50). O comercial
 * só vê os seus (RLS); os administradores veem e filtram pelo responsável (D-161).
 */
export default async function Leads({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; vista?: string; responsavel?: string }>;
}) {
  const { q = "", estado = "", vista = "todos", responsavel = "" } = await searchParams;
  const admin = eAdministrador((await exigirEquipaPlataforma()).papel);
  const hoje = hojeIso();
  const busca = normalizar(q.trim());
  const bd = await criarClienteServidor();
  const [todos, comerciais] = await Promise.all([
    listarLeads(bd),
    admin ? listarComerciais(bd) : [],
  ]);
  const nomes = new Map(comerciais.map((c) => [c.userId, c.nome]));
  const leads = todos.filter(
    (l) =>
      (vista !== "incompletos" || leadIncompleto({ origem: l.origem, temPasso2: l.temPasso2 })) &&
      (!estado || l.estado === estado) &&
      (!responsavel ||
        (responsavel === "sem" ? !l.responsavel_id : l.responsavel_id === responsavel)) &&
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
  // Os administradores veem de quem é cada lead (D-161).
  if (admin)
    colunas.push({
      id: "responsavel",
      rotulo: t.leads.colunas.responsavel,
      valor: (l) =>
        (l.responsavel_id && nomes.get(l.responsavel_id)) || (
          <span className="text-terciario">{t.leads.semResponsavel}</span>
        ),
    });
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
      <FiltrosLeads
        q={q}
        estado={estado}
        vista={vista}
        responsavel={responsavel}
        comerciais={admin ? comerciais : null}
      />
      <TabelaCartoes
        colunas={colunas}
        linhas={leads}
        chave={(l) => l.id}
        vazio={t.leads.vazio}
        testId="lead"
      />
      {admin ? <ApagarInativos /> : null}
    </div>
  );
}
