import { DesempenhoComercial } from "@/components/admin/comercial/desempenho-comercial";
import { DesempenhoEquipa } from "@/components/admin/comercial/desempenho-equipa";
import { FormularioMetaComercial } from "@/components/admin/comercial/formulario-meta-comercial";
import { Secao } from "@/components/nucleo/secao";
import { Button } from "@/components/ui/button";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { desempenhoDoMes } from "@/lib/comercial/desempenho";
import { mesAtual, mesPorExtenso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarComerciais } from "@/lib/repositorios/admin/equipa";
import { lerCondicoes } from "@/lib/repositorios/comercial/condicoes";
import {
  carteiraComercial,
  dadosDesempenho,
  metasDoMes,
} from "@/lib/repositorios/comercial/desempenho";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial.desempenho;
export const metadata = { title: `${t.titulo} · ${textos.comercial.titulo}` };

/**
 * Desempenho comercial (D-161). O comercial vê o seu mês, as metas e a carteira, como o
 * barbeiro vê o seu painel; o dono e o gestor veem a equipa e definem as metas.
 */
export default async function DesempenhoPagina({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes: pedido } = await searchParams;
  const mes = pedido && /^\d{4}-\d{2}$/.test(pedido) ? pedido : mesAtual();
  const quem = await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const [dados, metas, condicoes] = await Promise.all([
    dadosDesempenho(bd),
    metasDoMes(bd, mes),
    lerCondicoes(bd),
  ]);
  const calcular = (userId: string) =>
    desempenhoDoMes(
      userId,
      mes,
      dados.leads,
      dados.propostas,
      dados.contratos,
      condicoes.taxaAtiva,
    );
  const seletor = (
    <form className="flex flex-wrap items-end gap-2">
      <label className="grid gap-1.5">
        <span className="rotulo">{t.mes}</span>
        <input
          type="month"
          name="mes"
          defaultValue={mes}
          className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
        />
      </label>
      <Button type="submit" variant="outline" className="h-11">
        {textos.comercial.leads.filtrar}
      </Button>
    </form>
  );

  if (!eAdministrador(quem.papel)) {
    return (
      <div className="grid gap-4">
        <h2 className="text-lg font-bold">
          {t.meuTitulo} · {mesPorExtenso(mes)}
        </h2>
        <p className="text-sm text-muted-foreground">{t.ajuda}</p>
        {seletor}
        <DesempenhoComercial
          d={calcular(quem.userId)}
          meta={metas.get(quem.userId)}
          comissaoVisivel={condicoes.taxaAtiva}
          carteira={await carteiraComercial(bd)}
        />
      </div>
    );
  }

  const comerciais = await listarComerciais(bd);
  const carteiras = await Promise.all(comerciais.map((c) => carteiraComercial(bd, c.userId)));
  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-bold">
        {t.titulo} · {mesPorExtenso(mes)}
      </h2>
      <p className="text-sm text-muted-foreground">{t.ajudaEquipa}</p>
      {seletor}
      <DesempenhoEquipa
        comissaoVisivel={condicoes.taxaAtiva}
        linhas={comerciais.map((c, i) => ({
          userId: c.userId,
          nome: c.nome,
          d: calcular(c.userId),
          meta: metas.get(c.userId),
          carteira: carteiras[i]!.length,
        }))}
      />
      {comerciais.length ? (
        <Secao id="metas" titulo={t.metas}>
          <FormularioMetaComercial
            mes={mes}
            comerciais={Object.fromEntries(comerciais.map((c) => [c.userId, c.nome]))}
          />
        </Secao>
      ) : null}
    </div>
  );
}
