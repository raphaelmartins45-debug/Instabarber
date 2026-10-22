import { Indicador } from "@/components/nucleo/indicador";
import { Secao } from "@/components/nucleo/secao";
import { hojeIso, mesAtual } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { intervaloDoMes } from "@/lib/painel/calendario";
import { listarPlanos, listarSubscricoes, renovar } from "@/lib/repositorios/painel/clube";
import { mensalidadesRecebidas } from "@/lib/repositorios/painel/receitas";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioPlano } from "./formulario-plano";
import { InscreverCliente } from "./inscrever-cliente";
import { ListaSubscricoes } from "./lista-subscricoes";

const t = textos.sistema.clube;
const RENOVACOES_MAXIMAS = 12;

/**
 * Clube de assinatura (F.4.2): planos, subscritores, ciclos por pagar e indicadores. Sem tarefas
 * agendadas, as renovações automáticas em atraso fazem-se aqui, quando o gestor abre (D-122).
 */
export async function SeccaoClube({ inquilinoId }: { inquilinoId: string }) {
  const bd = await criarClienteServidor();
  const hoje = hojeIso();
  for (let i = 0; i < RENOVACOES_MAXIMAS; i++) {
    const devidas = (await listarSubscricoes(bd, inquilinoId)).filter(
      (s) => s.estado === "ativa" && s.renovacaoAuto && s.proximaRenovacao <= hoje,
    );
    if (devidas.length === 0) break;
    for (const s of devidas) await renovar(bd, s.id);
  }
  const [planos, subscricoes, servicos, recebido] = await Promise.all([
    listarPlanos(bd, inquilinoId),
    listarSubscricoes(bd, inquilinoId),
    listarServicos(bd, inquilinoId),
    mensalidadesRecebidas(bd, inquilinoId, intervaloDoMes(mesAtual())),
  ]);
  const ativas = subscricoes.filter((s) => s.estado === "ativa");
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-3 gap-3">
        <Indicador rotulo={t.indicadores.ativos} valor={String(ativas.length)} />
        <Indicador rotulo={t.indicadores.recebido} valor={formatarDinheiro(recebido)} />
        <Indicador
          rotulo={t.indicadores.creditos}
          valor={String(ativas.reduce((a, s) => a + s.creditosPorUsar, 0))}
        />
      </div>
      <Secao id="subscritores" titulo={t.subscritores}>
        <ListaSubscricoes subscricoes={subscricoes} />
        {planos.some((p) => p.ativo) ? (
          <InscreverCliente
            planos={planos.filter((p) => p.ativo).map((p) => ({ id: p.id, rotulo: p.nome }))}
            hoje={hoje}
          />
        ) : null}
      </Secao>
      <Secao id="planos" titulo={t.novo}>
        {planos.length === 0 ? <p className="text-sm text-muted-foreground">{t.vazio}</p> : null}
        {planos.map((p) => (
          <FormularioPlano key={p.id} plano={p} servicos={servicos} />
        ))}
        <FormularioPlano plano={null} servicos={servicos} />
      </Secao>
    </div>
  );
}
