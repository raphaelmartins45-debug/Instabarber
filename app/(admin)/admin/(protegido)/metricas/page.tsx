import { GraficoCrescimento } from "@/components/admin/gestao/grafico-crescimento";
import { Indicador } from "@/components/nucleo/indicador";
import { Secao } from "@/components/nucleo/secao";
import {
  conversaoLeads,
  origens,
  saidasMedias,
  serieCrescimento,
  tempoComoCliente,
} from "@/lib/admin/metricas";
import { ativaNoMes } from "@/lib/financas/indicadores";
import { hojeIso, mesAnterior, mesAtual, nomeDoMes, ultimosMeses } from "@/lib/formatacao/datas";
import { formatarPercentagem } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import { leadsParaMetricas } from "@/lib/repositorios/admin/saude";
import { barbeariasParaFinancas } from "@/lib/repositorios/financas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.gestao.metricas;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Crescimento da InstaBarber (sugestão E), D-159. */
export default async function Metricas() {
  const bd = await criarClienteServidor();
  const [barbearias, leads] = await Promise.all([
    barbeariasParaFinancas(bd),
    leadsParaMetricas(bd),
  ]);
  const meses = ultimosMeses(12).reverse();
  const serie = serieCrescimento(barbearias, meses);
  const antes = barbearias.filter((b) => ativaNoMes(b, mesAnterior(meses[0]!))).length;
  const medias = saidasMedias(serie, antes);
  const tempo = tempoComoCliente(barbearias, hojeIso());
  const conv = conversaoLeads(leads);
  const ativas = barbearias.filter((b) => ativaNoMes(b, mesAtual())).length;
  const listaOrigens = origens(barbearias, leads);
  const soma = (k: "novas" | "saidas") => serie.reduce((s, m) => s + m[k], 0);

  return (
    <section className="grid gap-6">
      <h1 className="text-[22px] font-extrabold tracking-tight">{t.titulo}</h1>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="metricas">
        <Indicador rotulo={t.ativas} valor={String(ativas)} />
        <Indicador rotulo={t.novas12} valor={String(soma("novas"))} />
        <Indicador rotulo={t.saidas12} valor={String(soma("saidas"))} />
        <Indicador
          rotulo={t.saidasMedias}
          valor={medias === null ? t.semValor : formatarPercentagem(medias)}
          detalhe={medias === null ? t.poucas : undefined}
        />
        <Indicador
          rotulo={t.tempo}
          valor={tempo.todas === null ? t.semValor : t.tempoValor(tempo.todas)}
          detalhe={tempo.queSairam === null ? undefined : t.tempoSairam(tempo.queSairam)}
        />
      </div>
      <Secao id="grafico" titulo={t.grafico}>
        <div className="cartao rounded-2xl p-4">
          <GraficoCrescimento
            meses={serie.map((m) => ({ ...m, rotulo: nomeDoMes(m.mes).slice(0, 3) }))}
            series={t.series}
            descricao={t.grafico}
          />
        </div>
      </Secao>
      <Secao id="origens" titulo={t.origens}>
        <ul className="cartao grid gap-2 rounded-2xl p-4 text-sm" data-testid="origens">
          {listaOrigens.length === 0 ? (
            <li className="text-muted-foreground">{t.semOrigens}</li>
          ) : null}
          {listaOrigens.map((o) => (
            <li key={o.origem} className="flex justify-between gap-4">
              <span>
                {o.origem === "direta"
                  ? t.origemDireta
                  : (textos.comercial.origens[o.origem] ?? o.origem)}
              </span>
              <span className="numero font-semibold">{o.n}</span>
            </li>
          ))}
        </ul>
      </Secao>
      <Secao id="conversao" titulo={t.conversao}>
        <div className="cartao grid gap-1 rounded-2xl p-4 text-sm" data-testid="conversao">
          <p>{t.conversaoValor(conv.ganhos, conv.perdidos, conv.abertos)}</p>
          <p className="text-muted-foreground">
            {conv.taxa === null
              ? t.conversaoPoucos
              : t.conversaoTaxa(formatarPercentagem(conv.taxa))}
          </p>
        </div>
      </Secao>
    </section>
  );
}
