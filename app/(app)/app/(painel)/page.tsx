import Link from "next/link";
import { LinhaMarcacao } from "@/components/barbearia/agenda/linha-marcacao";
import { ClientesContactar } from "@/components/barbearia/inicio/clientes-contactar";
import { ContasPendentes } from "@/components/barbearia/inicio/contas-pendentes";
import { IndicadoresInicio } from "@/components/barbearia/inicio/indicadores-inicio";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { PedidosAcesso } from "@/components/barbearia/pedidos-acesso";
import { Button } from "@/components/ui/button";
import { exigirGestor } from "@/lib/equipa/contexto";
import { diasDoMes, hojeIso, mesAtual } from "@/lib/formatacao/datas";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { paginaPublica } from "@/lib/inquilino/endereco";
import { intervaloDoDia } from "@/lib/painel/calendario";
import { indicadoresDia } from "@/lib/painel/indicadores";
import { radarClientes } from "@/lib/painel/radar";
import { mensagemLembrete } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import { listarMarcacoes } from "@/lib/repositorios/painel/agenda";
import { listarCustos, listarDespesas } from "@/lib/repositorios/painel/financeiro";
import { listarPedidosAcesso } from "@/lib/repositorios/codigos-acesso";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.inicio;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/** Início do gestor (E.2): faixa de ação, indicadores, marcações de hoje, pedidos, contas e clientes. */
export default async function InicioGestor() {
  const contexto = await exigirGestor();
  const id = contexto.barbearia.id;
  const bd = await criarClienteServidor();
  const grelha = await lerGrelha(id);
  const tem = (chave: string) => grelha.ativas.has(chave);
  const dias = diasDoMes(mesAtual());
  const [indicadores, pedidos, marcacoes, custos, despesas, radar, pagina] = await Promise.all([
    indicadoresDia(bd, id),
    listarPedidosAcesso(bd, id),
    listarMarcacoes(bd, id, intervaloDoDia(hojeIso())),
    tem("contas_a_pagar")
      ? listarCustos(bd, id, { ate: dias[dias.length - 1], soPorPagar: true })
      : [],
    tem("contas_a_pagar") ? listarDespesas(bd, id, { soPorPagar: true }) : [],
    tem("gestao_clientes") ? radarClientes(bd, id, null) : null,
    paginaPublica(contexto.barbearia.slug),
  ]);
  const agora = new Date();
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

  return (
    <PainelGestor atual="inicio">
      <div className="flex flex-wrap gap-2">
        <Button asChild className="h-11">
          <Link href="/app/agenda/marcar?modo=registar">{textos.agenda.balcao.registar}</Link>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link href="/app/agenda/marcar">{textos.agenda.balcao.marcar}</Link>
        </Button>
      </div>
      <IndicadoresInicio i={indicadores} />
      <section className="grid gap-3" aria-labelledby="hoje">
        <h2 id="hoje" className="text-[15px] font-bold">
          {t.hojeTitulo}
        </h2>
        {marcacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{textos.agenda.semMarcacoes}</p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {marcacoes.map((m) => (
              <LinhaMarcacao
                key={m.id}
                m={m}
                lembrete={lembrete(m)}
                mostrarProfissional
                agora={agora}
              />
            ))}
          </ul>
        )}
      </section>
      <PedidosAcesso pedidos={pedidos} barbearia={contexto.barbearia.nome} />
      {tem("contas_a_pagar") ? (
        <section className="grid gap-3" aria-labelledby="contas">
          <h2 id="contas" className="text-[15px] font-bold">
            {t.contasTitulo}
          </h2>
          <ContasPendentes contas={[...custos, ...despesas]} />
        </section>
      ) : null}
      {radar ? (
        <section className="grid gap-3" aria-labelledby="contactar">
          <h2 id="contactar" className="text-[15px] font-bold">
            {t.contactarTitulo}
          </h2>
          <ClientesContactar
            linhas={radar.linhas}
            mensagens={tem("envio_mensagens")}
            pagina={pagina}
            assinatura={contexto.barbearia.nome}
            base="/app/clientes"
          />
        </section>
      ) : null}
    </PainelGestor>
  );
}
