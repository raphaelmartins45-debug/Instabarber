import { Secao } from "@/components/nucleo/secao";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta, dataHora } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type {
  MovimentoSelos,
  PedidoCliente,
  SubscricaoCliente,
} from "@/lib/repositorios/painel/ficha-cliente";
import type { Visita } from "@/lib/repositorios/painel/visitas";

const t = textos.clientes.ficha;
const vazio = textos.comum.vazio;

/** Histórico na ficha do cliente: visitas, selos e resgates, clube, pedidos da loja e faltas. */
export function HistoricoCliente({
  visitas,
  servicos,
  profissionais,
  selos,
  subscricoes,
  pedidos,
  faltas,
}: {
  visitas: Visita[];
  servicos: Map<string, string>;
  profissionais: Map<string, string>;
  /** Nulo sem a funcionalidade `fidelizacao_selos`. */
  selos: { saldo: number; necessarios: number; movimentos: MovimentoSelos[] } | null;
  subscricoes: SubscricaoCliente[] | null;
  pedidos: PedidoCliente[] | null;
  faltas: string[];
}) {
  const lista = "grid gap-1 text-sm";
  return (
    <>
      <Secao id="visitas" titulo={t.visitas}>
        <TabelaCartoes<Visita>
          linhas={[...visitas].reverse()}
          chave={(v) => v.id}
          vazio={t.semVisitas}
          colunas={[
            { id: "data", rotulo: t.colunasVisita.data, valor: (v) => dataCurta(v.data) },
            {
              id: "servico",
              rotulo: t.colunasVisita.servico,
              valor: (v) => servicos.get(v.servicoId) ?? vazio,
            },
            {
              id: "profissional",
              rotulo: t.colunasVisita.profissional,
              valor: (v) =>
                v.profissionalId ? (profissionais.get(v.profissionalId) ?? vazio) : vazio,
            },
            {
              id: "valor",
              rotulo: t.colunasVisita.valor,
              valor: (v) => formatarDinheiro(v.valorCobradoCent),
            },
          ]}
        />
      </Secao>
      {selos ? (
        <Secao id="selos" titulo={t.selos}>
          <p className="text-sm font-semibold">{t.saldo(selos.saldo, selos.necessarios)}</p>
          <ul className={lista}>
            {selos.movimentos.map((m) => (
              <li key={m.id} className="flex justify-between gap-2">
                <span>
                  {t.movimentos[m.tipo] ?? m.tipo} · {dataHora(m.criadoEm)}
                </span>
                <span className="tabular-nums">
                  {m.quantidade > 0 ? `+${m.quantidade}` : m.quantidade}
                </span>
              </li>
            ))}
          </ul>
        </Secao>
      ) : null}
      {subscricoes ? (
        <Secao id="clube" titulo={t.clube}>
          {subscricoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.semClube}</p>
          ) : (
            <ul className={lista}>
              {subscricoes.map((s) => (
                <li key={s.id}>
                  {s.clube} · {textos.sistema.clube.estados[s.estado] ?? s.estado} ·{" "}
                  {textos.sistema.clube.renova(dataCurta(`${s.proximaRenovacao}T12:00:00Z`))}
                </li>
              ))}
            </ul>
          )}
        </Secao>
      ) : null}
      {pedidos ? (
        <Secao id="loja" titulo={t.loja}>
          {pedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.semPedidos}</p>
          ) : (
            <ul className={lista}>
              {pedidos.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span>
                    #{p.numero} · {dataCurta(p.criadoEm)} ·{" "}
                    {textos.loja.estadosPedido[p.estado] ?? p.estado}
                  </span>
                  <span className="tabular-nums">{formatarDinheiro(p.totalCent)}</span>
                </li>
              ))}
            </ul>
          )}
        </Secao>
      ) : null}
      <Secao id="faltas" titulo={t.faltas}>
        {faltas.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.semFaltas}</p>
        ) : (
          <ul className={lista}>
            {faltas.map((f) => (
              <li key={f}>{dataHora(f)}</li>
            ))}
          </ul>
        )}
      </Secao>
    </>
  );
}
