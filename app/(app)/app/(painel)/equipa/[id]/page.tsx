import Link from "next/link";
import { LinhaMarcacao } from "@/components/barbearia/agenda/linha-marcacao";
import { GraficoFaturacao } from "@/components/barbearia/inicio/grafico-faturacao";
import { LinhaDoTempo } from "@/components/barbearia/inicio/linha-do-tempo";
import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { IndicadoresProfissional } from "@/components/barbearia/profissional/indicadores-profissional";
import { AnelObjetivo } from "@/components/nucleo/anel-objetivo";
import { Button } from "@/components/ui/button";
import { hojeIso, horaCurta, instanteLocal, somarDias } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { intervaloDoDia } from "@/lib/painel/calendario";
import { indicadoresDia } from "@/lib/painel/indicadores";
import { radarClientes } from "@/lib/painel/radar";
import { taxaRegresso } from "@/lib/regras/classificacao";
import { mensagemLembrete } from "@/lib/regras/mensagens";
import { faturacaoPorDia } from "@/lib/regras/painel-inicio";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import { listarAusencias, listarMarcacoes } from "@/lib/repositorios/painel/agenda";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarVisitas } from "@/lib/repositorios/painel/visitas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

export const metadata = { title: vertical.camadas.equipa };
const t = textos.profissional.inicio;

/**
 * Início do barbeiro (E.3, D-203): o próximo cliente, o objetivo do mês em anel, os últimos 7
 * dias, os indicadores e o seu dia em linha do tempo. O gestor vê a área de qualquer barbeiro.
 */
export default async function InicioProfissional({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  const inq = area.contexto.barbearia.id;
  const bd = await criarClienteServidor();
  const hoje = hojeIso();
  const [indicadores, radar, marcacoes, config, ausencias, visitas7] = await Promise.all([
    indicadoresDia(bd, inq, id),
    radarClientes(bd, inq, id),
    listarMarcacoes(bd, inq, intervaloDoDia(hoje), { profissionalId: id }),
    obterConfiguracao(bd, inq),
    listarAusencias(bd, inq, intervaloDoDia(hoje)),
    listarVisitas(bd, inq, {
      de: instanteLocal(somarDias(hoje, -6), "00:00"),
      ate: instanteLocal(somarDias(hoje, 1), "00:00"),
      profissionalId: id,
    }),
  ]);
  const lembretes = area.grelha.ativas.has("lembretes_marcacao");
  const metas = area.grelha.ativas.has("metas_profissional");
  const agora = new Date();
  const nome = area.profissional.nome_apresentado;
  const proximas = marcacoes.filter((m) => m.estado === "agendada" && new Date(m.fim) > agora);
  const lembrete = (m: (typeof marcacoes)[number]) =>
    lembretes && m.telefone && m.cliente
      ? ligacaoWhatsApp(
          m.telefone,
          mensagemLembrete({
            cliente: m.cliente,
            servico: m.servico,
            inicio: m.inicio,
            barbeiro: nome,
            barbearia: area.contexto.barbearia.nome,
          }),
        )
      : null;
  const p = indicadores.progresso;
  const cartao = "cartao grid content-start gap-3 rounded-xl p-4";
  return (
    <PainelProfissional area={area} atual="inicio">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-titulo font-extrabold">{t.ola(nome)}</h1>
          <p className="text-sm text-muted-foreground">
            {t.resumo(marcacoes.length, proximas[0] ? horaCurta(proximas[0].inicio) : null)}
          </p>
        </div>
        {area.contexto.apoio ? null : (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-11">
              <Link href={`/app/equipa/${id}/disponibilidade#bloqueios`}>{t.bloquear}</Link>
            </Button>
            <Button asChild className="h-11">
              <Link href="/app/agenda/marcar">{textos.agenda.balcao.marcar}</Link>
            </Button>
          </div>
        )}
      </div>
      <div
        className={`grid items-start gap-3 md:grid-cols-2 ${metas && p.objetivoCent ? "lg:grid-cols-3" : ""}`}
      >
        <section className={`${cartao} border-destaque/40`} aria-labelledby="a-seguir">
          <h2 id="a-seguir" className="rotulo">
            {t.aSeguir}
          </h2>
          {proximas[0] ? (
            <ul className="grid">
              <LinhaMarcacao m={proximas[0]} agora={agora} lembrete={lembrete(proximas[0])} />
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t.semProxima}</p>
          )}
        </section>
        {metas && p.objetivoCent ? (
          <section className={cartao} aria-labelledby="objetivo">
            <h2 id="objetivo" className="rotulo">
              {t.objetivo}
            </h2>
            <div className="flex items-center gap-4">
              <AnelObjetivo percentagem={p.percentagem} rotulo={t.anel(p.percentagem)} />
              <div className="grid gap-1">
                <span className="numero text-xl font-bold">
                  {formatarDinheiro(indicadores.faturadoMesCent)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t.deObjetivo(formatarDinheiro(p.objetivoCent))}
                </span>
                {p.necessarioPorDiaCent > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    {t.porDia(formatarDinheiro(p.necessarioPorDiaCent))}
                  </span>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
        <section className={cartao}>
          <GraficoFaturacao titulo={t.semana} dias={faturacaoPorDia(visitas7, hoje, 7)} />
        </section>
      </div>
      <IndicadoresProfissional
        i={indicadores}
        metas={metas}
        extra={{
          ticketCent: radar.ticketMedioCent,
          regresso: taxaRegresso(radar.linhas.map((l) => l.visitas)),
        }}
      />
      <section className={cartao} aria-labelledby="meu-dia">
        <h2 id="meu-dia" className="text-sm font-bold">
          {t.meuDia}
        </h2>
        {marcacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{textos.agenda.semMarcacoes}</p>
        ) : (
          <>
            <div className="hidden md:block">
              <LinhaDoTempo
                dia={hoje}
                abertura={config.hora_abertura}
                fecho={config.hora_fecho}
                equipa={[{ id, nome }]}
                marcacoes={marcacoes}
                ausencias={ausencias}
                agora={agora}
              />
            </div>
            <ul className="grid gap-2 md:grid-cols-2">
              {proximas.slice(1).map((m) => (
                <LinhaMarcacao key={m.id} m={m} agora={agora} lembrete={lembrete(m)} />
              ))}
            </ul>
          </>
        )}
      </section>
    </PainelProfissional>
  );
}
