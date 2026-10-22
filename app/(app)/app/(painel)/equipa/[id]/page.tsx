import { LinhaMarcacao } from "@/components/barbearia/agenda/linha-marcacao";
import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { IndicadoresProfissional } from "@/components/barbearia/profissional/indicadores-profissional";
import { Secao } from "@/components/nucleo/secao";
import { hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { intervaloDoDia } from "@/lib/painel/calendario";
import { indicadoresDia } from "@/lib/painel/indicadores";
import { radarClientes } from "@/lib/painel/radar";
import { taxaRegresso } from "@/lib/regras/classificacao";
import { mensagemLembrete } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import { listarMarcacoes } from "@/lib/repositorios/painel/agenda";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

export const metadata = { title: vertical.camadas.equipa };

/**
 * Início do barbeiro (E.3): os seus indicadores e a agenda de hoje. O gestor vê a área de
 * qualquer barbeiro, com «Vista do gestor».
 */
export default async function InicioProfissional({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  const inq = area.contexto.barbearia.id;
  const bd = await criarClienteServidor();
  const [indicadores, radar, marcacoes] = await Promise.all([
    indicadoresDia(bd, inq, id),
    radarClientes(bd, inq, id),
    listarMarcacoes(bd, inq, intervaloDoDia(hojeIso()), { profissionalId: id }),
  ]);
  const lembretes = area.grelha.ativas.has("lembretes_marcacao");
  const agora = new Date();
  return (
    <PainelProfissional area={area} atual="inicio">
      <h1 className="text-[22px] font-extrabold">{area.profissional.nome_apresentado}</h1>
      <IndicadoresProfissional
        i={indicadores}
        metas={area.grelha.ativas.has("metas_profissional")}
        extra={{
          ticketCent: radar.ticketMedioCent,
          regresso: taxaRegresso(radar.linhas.map((l) => l.visitas)),
        }}
      />
      <Secao id="hoje" titulo={textos.profissional.agendaHoje}>
        {marcacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{textos.agenda.semMarcacoes}</p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {marcacoes.map((m) => (
              <LinhaMarcacao
                key={m.id}
                m={m}
                agora={agora}
                lembrete={
                  lembretes && m.telefone && m.cliente
                    ? ligacaoWhatsApp(
                        m.telefone,
                        mensagemLembrete({
                          cliente: m.cliente,
                          servico: m.servico,
                          inicio: m.inicio,
                          barbeiro: area.profissional.nome_apresentado,
                          barbearia: area.contexto.barbearia.nome,
                        }),
                      )
                    : null
                }
              />
            ))}
          </ul>
        )}
      </Secao>
    </PainelProfissional>
  );
}
