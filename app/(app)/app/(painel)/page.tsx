import Link from "next/link";
import { LinhaMarcacao } from "@/components/barbearia/agenda/linha-marcacao";
import { aContactar } from "@/components/barbearia/inicio/clientes-contactar";
import { CabecalhoInicio } from "@/components/barbearia/inicio/cabecalho-inicio";
import { ComunicadosInicio } from "@/components/barbearia/inicio/comunicados-inicio";
import { IndicadoresInicio } from "@/components/barbearia/inicio/indicadores-inicio";
import { LinhaDoTempo } from "@/components/barbearia/inicio/linha-do-tempo";
import { PrecisaAtencao } from "@/components/barbearia/inicio/precisa-atencao";
import { ResumoMes } from "@/components/barbearia/inicio/resumo-mes";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { exigirGestor } from "@/lib/equipa/contexto";
import { diasDoMes, hojeIso, instanteLocal, mesAtual, somarDias } from "@/lib/formatacao/datas";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { paginaPublica } from "@/lib/inquilino/endereco";
import { intervaloDoDia } from "@/lib/painel/calendario";
import { indicadoresDia } from "@/lib/painel/indicadores";
import { radarClientes } from "@/lib/painel/radar";
import { estaAberta } from "@/lib/regras/horario";
import { mensagemLembrete } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import { listarAusencias, listarMarcacoes } from "@/lib/repositorios/painel/agenda";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { listarVisitas } from "@/lib/repositorios/painel/visitas";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import { listarCustos, listarDespesas } from "@/lib/repositorios/painel/financeiro";
import { meusComunicados } from "@/lib/repositorios/painel/comunicados";
import { listarPedidosAcesso } from "@/lib/repositorios/codigos-acesso";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.inicio;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/**
 * Início do gestor (E.2, D-203): o estado de agora e as ações, os indicadores contra o objetivo,
 * o dia na cadeira (linha do tempo por barbeiro), o que precisa de atenção (pedidos, contas e
 * clientes a contactar), a faturação dos 30 dias e o mês por barbeiro e por serviço.
 */
export default async function InicioGestor() {
  const contexto = await exigirGestor();
  const id = contexto.barbearia.id;
  const bd = await criarClienteServidor();
  const grelha = await lerGrelha(id);
  const tem = (chave: string) => grelha.ativas.has(chave);
  const dias = diasDoMes(mesAtual());
  const hoje = hojeIso();
  const [indicadores, pedidos, marcacoes, custos, despesas, radar, pagina, comunicados] =
    await Promise.all([
      indicadoresDia(bd, id),
      listarPedidosAcesso(bd, id),
      listarMarcacoes(bd, id, intervaloDoDia(hoje)),
      tem("contas_a_pagar")
        ? listarCustos(bd, id, { ate: dias[dias.length - 1], soPorPagar: true })
        : [],
      tem("contas_a_pagar") ? listarDespesas(bd, id, { soPorPagar: true }) : [],
      tem("gestao_clientes") ? radarClientes(bd, id, null) : null,
      paginaPublica(contexto.barbearia.slug),
      // Na vista de apoio (super_admin, só leitura) não há gestor a quem mostrar os comunicados.
      contexto.apoio ? [] : meusComunicados(bd, id),
    ]);
  const [config, equipa, servicos, visitas30, ausencias] = await Promise.all([
    obterConfiguracao(bd, id),
    listarEquipa(bd, id),
    listarServicos(bd, id, false),
    listarVisitas(bd, id, {
      de: instanteLocal(somarDias(hoje, -29), "00:00"),
      ate: instanteLocal(somarDias(hoje, 1), "00:00"),
    }),
    listarAusencias(bd, id, intervaloDoDia(hoje)),
  ]);
  const agora = new Date();
  const ativos = equipa.filter((p) => p.ativo);
  const nomePro = new Map(equipa.map((p) => [p.id, p.nome_apresentado]));
  const nomeServico = new Map(servicos.map((s) => [s.id, s.nome]));
  const porFazer = marcacoes.filter((m) => m.estado === "agendada");
  // Na cartão de hoje só as próximas; a agenda tem o dia inteiro.
  const proximas = porFazer.filter((m) => new Date(m.fim) > new Date()).slice(0, 4);
  const contas = [...custos, ...despesas];
  const contactar = radar ? aContactar(radar.linhas) : [];
  const aberta = estaAberta({
    hora_abertura: config.hora_abertura,
    hora_fecho: config.hora_fecho,
    dias_descanso: config.dias_descanso ?? [],
    aberto: true,
  });
  const hm = (h: string) => h.slice(0, 5);
  const lembrete = (m: (typeof marcacoes)[number]) =>
    tem("lembretes_marcacao") && m.telefone && m.cliente
      ? ligacaoWhatsApp(
          m.telefone,
          mensagemLembrete({
            cliente: m.cliente,
            servico: m.servico,
            inicio: m.inicio,
            barbeiro: m.profissional ?? "",
            barbearia: contexto.barbearia.nome,
          }),
        )
      : null;

  const cartao = "cartao grid content-start gap-3 rounded-xl p-4";
  return (
    <PainelGestor atual="inicio">
      <ComunicadosInicio comunicados={comunicados} />
      <CabecalhoInicio
        hoje={hoje}
        aberta={aberta}
        fecho={hm(config.hora_fecho)}
        barbeiros={ativos.length}
      />
      <IndicadoresInicio
        i={indicadores}
        marcacoesHoje={marcacoes.length}
        porFazer={porFazer.length}
      />
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className={cartao} aria-labelledby="hoje">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="hoje" className="text-sm font-bold">
              {t.linha.titulo}
            </h2>
            <Link href="/app/agenda" className="text-xs font-semibold text-ligacao hover:underline">
              {t.linha.verAgenda}
            </Link>
          </div>
          {marcacoes.length === 0 && ausencias.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.linha.vazio}</p>
          ) : (
            <div className="hidden md:block">
              <LinhaDoTempo
                dia={hoje}
                abertura={config.hora_abertura}
                fecho={config.hora_fecho}
                equipa={ativos.map((p) => ({ id: p.id, nome: p.nome_apresentado }))}
                marcacoes={marcacoes}
                ausencias={ausencias}
                agora={agora}
              />
            </div>
          )}
          {proximas.length ? (
            <>
              <h3 className="rotulo pt-1">{t.aSeguir}</h3>
              <ul className="grid gap-2 md:grid-cols-2">
                {proximas.map((m) => (
                  <LinhaMarcacao
                    key={m.id}
                    m={m}
                    lembrete={lembrete(m)}
                    mostrarProfissional
                    agora={agora}
                  />
                ))}
              </ul>
            </>
          ) : null}
        </section>
        <PrecisaAtencao
          pedidos={pedidos}
          barbearia={contexto.barbearia.nome}
          contas={tem("contas_a_pagar") ? contas : []}
          contactar={contactar}
          mensagens={tem("envio_mensagens")}
          pagina={pagina}
        />
      </div>
      <ResumoMes
        hoje={hoje}
        visitas30={visitas30}
        visitasMes={indicadores.visitasMes}
        nomePro={Object.fromEntries(nomePro)}
        nomeServico={Object.fromEntries(nomeServico)}
      />
    </PainelGestor>
  );
}
