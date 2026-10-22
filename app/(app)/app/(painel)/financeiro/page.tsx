import { ContasMes } from "@/components/barbearia/financeiro/contas-mes";
import { ObjetivosMes } from "@/components/barbearia/financeiro/objetivos-mes";
import { ResumoMes } from "@/components/barbearia/financeiro/resumo-mes";
import { SeletorMes } from "@/components/barbearia/financeiro/seletor-mes";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { Secao } from "@/components/nucleo/secao";
import { exigirGestor } from "@/lib/equipa/contexto";
import { hojeIso, mesAtual, primeiroDoMes } from "@/lib/formatacao/datas";
import { exigirFuncionalidade, lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { financeiroDoMes } from "@/lib/painel/financeiro";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.financeiro;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/** Financeiro do gestor (E.2): objetivo do mês, por profissional, contas e resumo. */
export default async function Financeiro({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const contexto = await exigirGestor();
  const inq = contexto.barbearia.id;
  await exigirFuncionalidade(inq, "financeiro_objetivos");
  const { mes: pedido } = await searchParams;
  const mes = pedido && /^\d{4}-\d{2}$/.test(pedido) ? pedido : mesAtual();
  const bd = await criarClienteServidor();
  const [f, grelha] = await Promise.all([financeiroDoMes(bd, inq, mes), lerGrelha(inq)]);
  const editavel = !contexto.apoio;
  return (
    <PainelGestor atual="financeiro">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
        <SeletorMes mes={mes} base="/app/financeiro" />
      </div>
      <Secao id="objetivo" titulo={t.objetivo.titulo}>
        <ObjetivosMes
          key={mes}
          mes={primeiroDoMes(mes)}
          progresso={f.progresso}
          profissionais={f.objetivosProfissionais}
          porProfissional={grelha.ativas.has("metas_profissional")}
          editavel={editavel}
        />
      </Secao>
      <Secao id="resumo" titulo={t.resumo.titulo}>
        <ResumoMes r={f.resumo} />
      </Secao>
      {grelha.ativas.has("contas_a_pagar") ? (
        <Secao id="contas" titulo={t.contas.titulo}>
          <ContasMes contas={[...f.custos, ...f.despesas]} hoje={hojeIso()} editavel={editavel} />
        </Secao>
      ) : null}
    </PainelGestor>
  );
}
