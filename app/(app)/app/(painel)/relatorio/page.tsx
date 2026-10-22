import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { Relatorio } from "@/components/barbearia/relatorio/relatorio";
import { exigirGestor } from "@/lib/equipa/contexto";
import { exigirFuncionalidade, lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { relatorioDoMes } from "@/lib/painel/relatorio";
import { lerMesRelatorio, mesesDoRelatorio } from "@/lib/painel/relatorio-acesso";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.relatorio;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/** Relatório mensal do gestor (E.5): a barbearia inteira. */
export default async function RelatorioGestor({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const contexto = await exigirGestor();
  const id = contexto.barbearia.id;
  await exigirFuncionalidade(id, "relatorio_mensal");
  const mes = lerMesRelatorio((await searchParams).mes);
  const bd = await criarClienteServidor();
  const [grelha, b] = await Promise.all([lerGrelha(id), obterConfiguracao(bd, id)]);
  const r = await relatorioDoMes(bd, b, mes, null, grelha.ativas);
  return (
    <PainelGestor atual="relatorio">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <Relatorio
        r={r}
        meses={mesesDoRelatorio()}
        base="/app/relatorio"
        pdf={`/api/relatorios?mes=${mes}`}
        mensagens={grelha.ativas.has("envio_mensagens")}
      />
    </PainelGestor>
  );
}
