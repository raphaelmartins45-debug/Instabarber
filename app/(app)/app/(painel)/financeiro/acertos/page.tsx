import { RegistarAcerto } from "@/components/barbearia/financeiro/registar-acerto";
import { SeletorMes } from "@/components/barbearia/financeiro/seletor-mes";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { exigirGestor } from "@/lib/equipa/contexto";
import { hojeIso, mesAtual, primeiroDoMes } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { acertosDoMes, type LinhaAcertoProfissional } from "@/lib/painel/acertos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.financeiro.acertos;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/** Comissões e acertos (E.2, F.4.11): uma linha por barbeiro e «Registar acerto». */
export default async function Acertos({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const contexto = await exigirGestor();
  const inq = contexto.barbearia.id;
  await exigirFuncionalidade(inq, "comissoes_acertos");
  const { mes: pedido } = await searchParams;
  const mes = pedido && /^\d{4}-\d{2}$/.test(pedido) ? pedido : mesAtual();
  const { linhas } = await acertosDoMes(await criarClienteServidor(), inq, mes);
  return (
    <PainelGestor atual="comissoes">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
        <SeletorMes mes={mes} base="/app/financeiro/acertos" />
      </div>
      <TabelaCartoes<LinhaAcertoProfissional>
        linhas={linhas}
        chave={(l) => l.profissionalId}
        vazio={t.vazio}
        testId="linha-acerto"
        colunas={[
          {
            id: "barbeiro",
            rotulo: t.colunas.barbeiro,
            valor: (l) => <span className="font-semibold">{l.nome}</span>,
          },
          {
            id: "modelo",
            rotulo: t.colunas.modelo,
            valor: (l) => textos.sistema.equipa.modelos[l.modelo],
          },
          { id: "servicos", rotulo: t.colunas.servicos, valor: (l) => String(l.servicos) },
          {
            id: "receita",
            rotulo: t.colunas.receita,
            valor: (l) => formatarDinheiro(l.receitaCent),
          },
          { id: "acerto", rotulo: t.colunas.acerto, valor: (l) => formatarDinheiro(l.acertoCent) },
          {
            id: "liquidado",
            rotulo: t.colunas.liquidado,
            valor: (l) => formatarDinheiro(l.liquidadoCent),
          },
          {
            id: "saldo",
            rotulo: t.colunas.saldo,
            valor: (l) => formatarDinheiro(l.porLiquidarCent),
          },
          { id: "estado", rotulo: t.colunas.estado, valor: (l) => t.estados[l.estado] },
        ]}
      />
      {!contexto.apoio ? (
        <RegistarAcerto
          key={mes}
          mes={primeiroDoMes(mes)}
          hoje={hojeIso()}
          opcoes={linhas.map((l) => ({
            profissionalId: l.profissionalId,
            nome: l.nome,
            sentido: l.estado === "a_receber" ? "a_receber" : "a_pagar",
            porLiquidarCent: l.porLiquidarCent,
          }))}
        />
      ) : null}
      <p className="text-sm text-muted-foreground">{t.nota}</p>
    </PainelGestor>
  );
}
