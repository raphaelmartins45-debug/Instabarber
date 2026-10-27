import Link from "next/link";
import { notFound } from "next/navigation";
import { DecisaoComprovativo } from "@/components/admin/decisao-comprovativo";
import { mensalidadeCent, periodoDe } from "@/lib/admin/comprovativos";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { dataCurta, dataHora } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { listarFaturas } from "@/lib/repositorios/admin/pagamentos";
import { obterComprovativo, urlDoComprovativo } from "@/lib/repositorios/comprovativos";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comprovativos;
const c$ = t.admin.campos;
export const metadata = { title: `${t.admin.titulo} · ${textos.marca.nome}` };

/** Conferir um comprovativo de pagamento (D-168): o ficheiro, os dados e a decisão. */
export default async function ComprovativoPagamento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirSuperAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const bd = await criarClienteServidor();
  const c = await obterComprovativo(bd, id);
  if (!c) notFound();
  const [b, faturas, url] = await Promise.all([
    obterConfiguracao(bd, c.inquilino_id),
    listarFaturas(bd, c.inquilino_id),
    urlDoComprovativo(bd, c.caminho),
  ]);
  const fatura = faturas.find((f) => f.id === c.fatura_id);
  const esperado = fatura?.valor_centimos ?? mensalidadeCent(b);
  const dia = (d: string) => dataCurta(`${d}T12:00:00Z`);
  const dados: [string, string][] = [
    [c$.barbearia, b.nome],
    [c$.responsavel, b.responsavel ?? textos.comum.vazio],
    [
      c$.plano,
      `${textos.admin.planos[b.plano as "basic"]} · ${textos.admin.periodicidades[b.periodicidade as "mensal"]}`,
    ],
    [c$.periodo, periodoDe(c)],
    [c$.fatura, fatura?.numero ?? c$.semFatura],
    [c$.esperado, formatarDinheiro(esperado)],
    [c$.pago, formatarDinheiro(c.valor_centimos)],
    [c$.metodo, t.metodos[c.metodo] ?? c.metodo],
    [c$.data, dia(c.pago_em)],
    [c$.enviado, dataHora(c.enviado_em)],
    [
      c$.estado,
      c.estado === "recusado" && c.motivo ? t.recusadoPorque(c.motivo) : t.estados[c.estado]!,
    ],
  ];
  const pdf = c.caminho.endsWith(".pdf");
  return (
    <section className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-[22px] font-extrabold">{t.admin.titulo}</h1>
        <Link
          href={`/admin/barbearias/${b.id}/pagamentos`}
          className="text-sm text-ligacao underline-offset-4 hover:underline"
        >
          {b.nome}
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-2 rounded-lg border bg-card p-4">
          <h2 className="text-[15px] font-bold text-ligacao">{t.admin.dados}</h2>
          <dl className="grid gap-1.5 text-sm" data-testid="comprovativo-dados">
            {dados.map(([rotulo, valor]) => (
              <div key={rotulo} className="flex justify-between gap-3 border-b py-1 last:border-0">
                <dt className="text-muted-foreground">{rotulo}</dt>
                <dd className="text-right">{valor}</dd>
              </div>
            ))}
          </dl>
          {c.valor_centimos !== esperado ? (
            <p className="text-sm text-destructive">
              {t.admin.diferenca(formatarDinheiro(Math.abs(c.valor_centimos - esperado)))}
            </p>
          ) : null}
        </div>
        <div className="grid content-start gap-2 rounded-lg border bg-card p-4">
          {url && !pdf ? (
            // eslint-disable-next-line @next/next/no-img-element -- ligação temporária e privada do Storage
            <img
              src={url}
              alt={t.admin.titulo}
              className="max-h-[70vh] w-full rounded-md object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t.admin.semPrevisualizacao}</p>
          )}
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-ligacao underline-offset-4 hover:underline"
            >
              {t.admin.abrirFicheiro}
            </a>
          ) : null}
        </div>
      </div>
      <DecisaoComprovativo id={c.id} pendente={c.estado === "pendente"} />
    </section>
  );
}
