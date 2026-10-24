import Link from "next/link";
import { Indicador } from "@/components/nucleo/indicador";
import { SeparadorAuditoria } from "@/components/admin/separadores/separador-auditoria";
import { hojeIso, somarDias } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { contarAlertas, faltamFeriados } from "@/lib/regras/alertas-admin";
import { leadParado, propostaAExpirar } from "@/lib/regras/comercial";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { receitaMensal } from "@/lib/regras/receita";
import { listarBarbearias } from "@/lib/repositorios/admin/barbearias";
import { listarLeads, validadesEnviadas } from "@/lib/repositorios/comercial/leads";
import { contarFeriadosNacionais, datasFeriadosNacionais } from "@/lib/repositorios/feriados";
import { listarPedidos } from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.painel;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Painel geral (E.1): quatro indicadores, alertas e atividade recente. */
export default async function PainelGeral() {
  const bd = await criarClienteServidor();
  const hoje = hojeIso();
  const proximoAno = Number(hoje.slice(0, 4)) + 1;
  const [barbearias, pendentes, feriados, leads, validades, feriadosRecentes] = await Promise.all([
    listarBarbearias(bd),
    listarPedidos(bd),
    contarFeriadosNacionais(bd, proximoAno),
    listarLeads(bd),
    validadesEnviadas(bd),
    datasFeriadosNacionais(bd, somarDias(hoje, -60), hoje),
  ]);
  const parados = leads.filter((l) =>
    leadParado(
      { estado: l.estado, criadoEm: hojeIso(new Date(l.criado_em)) },
      hoje,
      feriadosRecentes,
    ),
  ).length;
  const aExpirar = validades.filter((v) => propostaAExpirar(v, hoje)).length;
  const mrr = receitaMensal(barbearias, lerRegimeIva(process.env.PRESTADORA_REGIME_IVA));
  const adesoesMes = barbearias.filter(
    (b) => b.aprovado_em && hojeIso(new Date(b.aprovado_em)).slice(0, 7) === hoje.slice(0, 7),
  ).length;
  const a = contarAlertas(barbearias, hoje);
  const alertas = [
    a.atraso ? { texto: t.atraso(a.atraso), href: "/admin/pagamentos" } : null,
    a.suspensas
      ? { texto: t.suspensas(a.suspensas), href: "/admin/barbearias?estado=suspenso" }
      : null,
    a.vencimentos ? { texto: t.vencimentos(a.vencimentos), href: "/admin/pagamentos" } : null,
    faltamFeriados(hoje, feriados) ? { texto: t.feriados(proximoAno), href: "/admin" } : null,
    parados
      ? { texto: textos.comercial.alertas.leadsParados(parados), href: "/admin/comercial" }
      : null,
    aExpirar
      ? { texto: textos.comercial.alertas.propostasAExpirar(aExpirar), href: "/admin/comercial" }
      : null,
  ].filter((x) => x !== null);

  return (
    <section className="grid gap-6">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador
          rotulo={t.ativas}
          valor={String(barbearias.filter((b) => b.estado === "ativo").length)}
        />
        <Indicador
          rotulo={t.receita}
          valor={formatarDinheiro(mrr.comIva)}
          detalhe={t.semIva(formatarDinheiro(mrr.semIva))}
        />
        <Indicador rotulo={t.adesoesMes} valor={String(adesoesMes)} />
        <Indicador
          rotulo={t.pendentes}
          valor={String(pendentes.length)}
          alerta={pendentes.length > 0}
        />
      </div>
      <section className="grid gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.alertas}</h2>
        {alertas.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.semAlertas}</p>
        ) : (
          <ul className="grid gap-2">
            {alertas.map((x) => (
              <li
                key={x.texto}
                className="rounded-lg border border-destaque/40 bg-accent px-3 py-2 text-sm"
              >
                <Link href={x.href} className="underline-offset-4 hover:underline">
                  {x.texto}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="grid gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.atividade}</h2>
        <SeparadorAuditoria limite={10} />
      </section>
    </section>
  );
}
