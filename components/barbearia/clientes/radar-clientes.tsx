import Link from "next/link";
import { BotaoMensagem } from "@/components/barbearia/botao-mensagem";
import { BotaoUpgrade, ChamadaUpgrade } from "@/components/nucleo/chamada-upgrade";
import { Indicador } from "@/components/nucleo/indicador";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { mensagemParaCliente } from "@/lib/painel/mensagens";
import { filtrarRadar, type FiltroRadar, type LinhaRadar, type Radar } from "@/lib/painel/radar";
import { cn } from "@/lib/utils";

const t = textos.clientes;
const FILTROS: FiltroRadar[] = [
  "todos",
  "ativo",
  "em_risco",
  "perdido",
  "sem_historico",
  "nao_registados",
];

/**
 * Radar de clientes (E.2, E.3): indicadores, filtros, busca, faixa de ação e tabela com a
 * mensagem pronta. A classificação já vem calculada para o painel certo (barbearia ou barbeiro).
 */
export function RadarClientes({
  radar,
  filtro,
  busca,
  base,
  mensagens,
  indicadoresRadar,
  pagina,
  assinatura,
}: {
  radar: Radar;
  filtro: FiltroRadar;
  busca: string;
  /** Endereço desta lista (os filtros e a ficha penduram-se aqui). */
  base: string;
  mensagens: boolean;
  /** `clientes_perdidos`: perdidos e faturação a recuperar. */
  indicadoresRadar: boolean;
  pagina: string;
  assinatura: string;
}) {
  const linhas = filtrarRadar(radar.linhas, filtro, busca);
  const comMensagem = linhas.filter((l) => mensagemParaCliente(l, pagina, assinatura));
  const href = (f: FiltroRadar) =>
    `${base}?filtro=${f}${busca ? `&q=${encodeURIComponent(busca)}` : ""}`;

  return (
    <div className="grid gap-4">
      {indicadoresRadar ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Indicador
            rotulo={t.indicadores.perdidos}
            valor={String(radar.perdidos)}
            alerta={radar.perdidos > 0}
          />
          <Indicador rotulo={t.indicadores.emRisco} valor={String(radar.emRisco)} />
          <Indicador
            rotulo={t.indicadores.aRecuperar}
            valor={formatarDinheiro(radar.aRecuperarCent)}
            detalhe={t.indicadores.aRecuperarAjuda}
          />
          <Indicador
            rotulo={t.indicadores.ticket}
            valor={formatarDinheiro(radar.ticketMedioCent)}
          />
        </div>
      ) : null}
      {indicadoresRadar && !mensagens && radar.perdidos > 0 ? (
        <ChamadaUpgrade
          curta={textos.upgrade.radar(radar.perdidos, formatarDinheiro(radar.aRecuperarCent))}
        />
      ) : null}
      <nav aria-label={t.filtrosRotulo} className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            aria-current={f === filtro ? "page" : undefined}
            className={cn(
              "flex h-10 shrink-0 items-center rounded-full border px-4 text-sm",
              f === filtro
                ? "border-foreground bg-foreground text-background"
                : "bg-card hover:bg-muted",
            )}
          >
            {t.filtros[f]}
          </Link>
        ))}
      </nav>
      <form action={base} className="flex gap-2">
        <input type="hidden" name="filtro" value={filtro} />
        <label htmlFor="q" className="sr-only">
          {t.busca}
        </label>
        <input
          id="q"
          name="q"
          defaultValue={busca}
          placeholder={t.busca}
          className="h-11 flex-1 rounded-md border bg-card px-3 text-sm"
        />
        <button type="submit" className="h-11 rounded-md border bg-card px-4 text-sm">
          {textos.comum.pesquisar}
        </button>
      </form>
      <p className="rounded-lg bg-muted px-3 py-2 text-sm">
        {t.faixa[filtro]}
        {mensagens && filtro !== "todos" ? ` · ${t.destinatarios(comMensagem.length)}` : ""}
      </p>
      <TabelaCartoes<LinhaRadar>
        linhas={linhas}
        chave={(l) => l.cliente.id}
        vazio={t.vazio}
        testId="linha-cliente"
        colunas={[
          {
            id: "cliente",
            rotulo: t.colunas.cliente,
            valor: (l) => (
              <Link
                href={`${base}/${l.cliente.id}`}
                className="font-semibold text-ligacao underline-offset-4 hover:underline"
              >
                {l.cliente.nome}
              </Link>
            ),
          },
          {
            id: "estado",
            rotulo: t.colunas.estado,
            valor: (l) => t.estados[l.classificacao.estado],
          },
          {
            id: "ultima",
            rotulo: t.colunas.ultima,
            valor: (l) =>
              l.classificacao.ultimaVisita
                ? dataCurta(l.classificacao.ultimaVisita)
                : textos.comum.vazio,
          },
          {
            id: "dias",
            rotulo: t.colunas.dias,
            valor: (l) =>
              l.classificacao.diasSemVir === null
                ? textos.comum.vazio
                : String(l.classificacao.diasSemVir),
          },
          {
            id: "ticket",
            rotulo: t.colunas.ticket,
            valor: (l) => formatarDinheiro(l.ticketMedioCent),
          },
          { id: "selos", rotulo: t.colunas.selos, valor: (l) => String(l.selos) },
          {
            id: "mensagem",
            rotulo: t.colunas.mensagem,
            valor: (l) => {
              if (!mensagens) return <BotaoUpgrade rotulo={t.mensagem} />;
              const m = mensagemParaCliente(l, pagina, assinatura);
              if (m)
                return (
                  <BotaoMensagem
                    ligacao={m.ligacao}
                    clienteId={l.cliente.id}
                    tipo={m.tipo}
                    conteudo={m.conteudo}
                    rotulo={t.mensagem}
                  />
                );
              return (
                <span className="text-xs text-muted-foreground">
                  {l.cliente.nao_contactar
                    ? t.naoContactar
                    : !l.contactavel
                      ? t.semConsentimento
                      : textos.comum.vazio}
                </span>
              );
            },
          },
        ]}
      />
    </div>
  );
}
