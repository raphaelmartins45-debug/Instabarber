import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { Relatorio } from "@/components/barbearia/relatorio/relatorio";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { relatorioDoMes } from "@/lib/painel/relatorio";
import { lerMesRelatorio, mesesDoRelatorio } from "@/lib/painel/relatorio-acesso";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.relatorio;
export const metadata = { title: `${t.tituloProfissional} · ${vertical.camadas.equipa}` };

/** «O meu relatório» (E.5): o que o barbeiro produziu, sem o financeiro da barbearia. */
export default async function RelatorioProfissional({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mes?: string }>;
}) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  await exigirFuncionalidade(area.contexto.barbearia.id, "relatorios_por_profissional");
  const mes = lerMesRelatorio((await searchParams).mes);
  const bd = await criarClienteServidor();
  const b = await obterConfiguracao(bd, area.contexto.barbearia.id);
  const r = await relatorioDoMes(bd, b, mes, id, area.grelha.ativas);
  return (
    <PainelProfissional area={area} atual="relatorio">
      <h1 className="text-[22px] font-extrabold">{t.tituloProfissional}</h1>
      <Relatorio
        r={r}
        meses={mesesDoRelatorio()}
        base={`/app/equipa/${id}/relatorio`}
        pdf={`/api/relatorios?mes=${mes}&profissional=${id}`}
        mensagens={area.grelha.ativas.has("envio_mensagens")}
      />
    </PainelProfissional>
  );
}
