import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva, type Periodicidade, type Plano } from "@/lib/regras/mensalidade";
import { precoDaBarbearia } from "@/lib/regras/receita";
import { listarBarbearias, type LinhaBarbearia } from "@/lib/repositorios/admin/barbearias";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.barbearias;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";

/** Lista com pesquisa e filtros por estado, plano e periodicidade (E.1). */
export default async function Barbearias({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const f = await searchParams;
  const linhas = await listarBarbearias(await criarClienteServidor(), {
    pesquisa: f.q?.slice(0, 80),
    estado: f.estado && f.estado in textos.admin.estados ? f.estado : undefined,
    plano: f.plano && f.plano in textos.admin.planos ? f.plano : undefined,
    periodicidade:
      f.periodicidade && f.periodicidade in textos.admin.periodicidades
        ? f.periodicidade
        : undefined,
  });
  const regime = lerRegimeIva(process.env.PRESTADORA_REGIME_IVA);
  const filtro = (nome: string, rotulo: string, opcoes: Record<string, string>) => (
    <label className="grid gap-1.5 text-sm">
      <span className={etiqueta}>{rotulo}</span>
      <select
        name={nome}
        defaultValue={f[nome] ?? ""}
        className="h-11 rounded-md border bg-card px-3"
      >
        <option value="">{textos.comum.todos}</option>
        {Object.entries(opcoes).map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section className="grid gap-4">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <form className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end">
        <label className="grid gap-1.5 text-sm">
          <span className={etiqueta}>{textos.comum.pesquisar}</span>
          <input
            name="q"
            defaultValue={f.q ?? ""}
            placeholder={t.pesquisa}
            className="h-11 rounded-md border bg-card px-3"
          />
        </label>
        {filtro("estado", t.estado, textos.admin.estados)}
        {filtro("plano", t.plano, textos.admin.planos)}
        {filtro("periodicidade", t.periodicidade, textos.admin.periodicidades)}
        <Button type="submit" className="h-11">
          {t.filtrar}
        </Button>
      </form>
      <TabelaCartoes<LinhaBarbearia>
        linhas={linhas}
        chave={(b) => b.id}
        vazio={t.vazio}
        testId="barbearia"
        colunas={[
          {
            id: "nome",
            rotulo: t.colunas.nome,
            valor: (b) => (
              <Link
                href={`/admin/barbearias/${b.id}`}
                className="font-semibold text-ligacao underline"
              >
                {b.nome}
              </Link>
            ),
          },
          {
            id: "plano",
            rotulo: t.colunas.plano,
            valor: (b) =>
              `${textos.admin.planos[b.plano as Plano]} · ${textos.admin.periodicidades[b.periodicidade as Periodicidade]}`,
          },
          {
            id: "estado",
            rotulo: t.colunas.estado,
            valor: (b) => textos.admin.estados[b.estado as "ativo"],
          },
          {
            id: "funcionalidades",
            rotulo: t.colunas.funcionalidades,
            valor: (b) => b.funcionalidades_ativas,
          },
          {
            id: "endereco",
            rotulo: t.colunas.endereco,
            valor: (b) => b.dominio_proprio ?? `/${b.slug}`,
          },
          {
            id: "mensalidade",
            rotulo: t.colunas.mensalidade,
            valor: (b) =>
              formatarDinheiro(precoDaBarbearia({ ...b, estado: "ativo" }, regime).comIva),
          },
        ]}
      />
    </section>
  );
}
