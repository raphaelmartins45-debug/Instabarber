import Link from "next/link";
import { notFound } from "next/navigation";
import { AnonimizarCliente, PermitirMarcacao } from "@/components/barbearia/clientes/acoes-ficha";
import { DadosCliente } from "@/components/barbearia/clientes/dados-cliente";
import { FichaTecnica } from "@/components/barbearia/clientes/ficha-tecnica";
import { HistoricoCliente } from "@/components/barbearia/clientes/historico-cliente";
import { PainelEquipa } from "@/components/barbearia/painel-equipa";
import { Secao } from "@/components/nucleo/secao";
import { obterContextoEquipa } from "@/lib/equipa/contexto";
import { dataCurta } from "@/lib/formatacao/datas";
import { exigirFuncionalidade, lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { obterCliente, saldoSelos } from "@/lib/repositorios/painel/clientes";
import {
  listarFaltas,
  listarFichaTecnica,
  listarMovimentosSelos,
  listarPedidosCliente,
  listarSubscricoesCliente,
} from "@/lib/repositorios/painel/ficha-cliente";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { listarVisitas } from "@/lib/repositorios/painel/visitas";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.clientes.ficha;
export const metadata = { title: `${textos.clientes.titulo} · ${vertical.camadas.gestao}` };

/**
 * Ficha do cliente (E.2): dados, consentimento, visitas, selos, clube, loja, ficha técnica e
 * faltas. O barbeiro abre só as dos seus clientes (RLS) e vê só as visitas com ele.
 */
export default async function FichaCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contexto = await obterContextoEquipa();
  const inq = contexto.barbearia.id;
  await exigirFuncionalidade(inq, "gestao_clientes");
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const bd = await criarClienteServidor();
  const cliente = await obterCliente(bd, inq, id);
  if (!cliente) notFound();
  const grelha = await lerGrelha(inq);
  const tem = (c: string) => grelha.ativas.has(c);
  const [
    b,
    visitas,
    servicos,
    equipa,
    selos,
    movimentos,
    subscricoes,
    pedidos,
    faltas,
    notas,
    bloqueio,
  ] = await Promise.all([
    obterConfiguracao(bd, inq),
    listarVisitas(bd, inq, { clienteId: id }),
    listarServicos(bd, inq, false),
    listarEquipa(bd, inq),
    tem("fidelizacao_selos") ? saldoSelos(bd, id) : 0,
    tem("fidelizacao_selos") ? listarMovimentosSelos(bd, id) : [],
    tem("clube_assinatura") ? listarSubscricoesCliente(bd, id) : [],
    tem("loja_produtos") ? listarPedidosCliente(bd, id) : [],
    listarFaltas(bd, id),
    tem("ficha_tecnica") ? listarFichaTecnica(bd, id) : [],
    tem("politica_faltas") ? bd.rpc("marcacao_online_bloqueada", { p_cliente: id }) : null,
  ]);
  const voltar = contexto.eGestor
    ? "/app/clientes"
    : `/app/equipa/${contexto.profissionalId}/clientes`;

  return (
    <PainelEquipa atual="clientes">
      <Link href={voltar} className="text-sm text-ligacao underline-offset-4 hover:underline">
        {t.voltar}
      </Link>
      <h1 className="text-[22px] font-extrabold" data-testid="ficha-cliente">
        {cliente.nome}
      </h1>
      {bloqueio?.data && contexto.eGestor && !contexto.apoio ? <PermitirMarcacao id={id} /> : null}
      <Secao id="dados" titulo={t.dados}>
        <p className="text-sm text-muted-foreground">
          {t.origem}: {t.origens[cliente.origem] ?? cliente.origem}
        </p>
        <DadosCliente
          id={id}
          editavel={contexto.eGestor && !contexto.apoio && !cliente.anonimizado_em}
          consentimentoDesde={cliente.consentimento_em ? dataCurta(cliente.consentimento_em) : null}
          inicial={{
            nome: cliente.nome,
            telefone: cliente.telefone ?? "",
            email: cliente.email ?? "",
            data_nascimento: cliente.data_nascimento ?? "",
            nif: cliente.nif ?? "",
            notas: cliente.notas ?? "",
            consentimento_mensagens: cliente.consentimento_mensagens,
            nao_contactar: cliente.nao_contactar,
          }}
        />
      </Secao>
      {tem("ficha_tecnica") ? (
        <Secao id="tecnica" titulo={textos.clientes.tecnica.titulo}>
          <FichaTecnica
            clienteId={id}
            notas={notas}
            eGestor={contexto.eGestor}
            userId={contexto.userId}
          />
        </Secao>
      ) : null}
      <HistoricoCliente
        visitas={visitas}
        servicos={new Map(servicos.map((s) => [s.id, s.nome]))}
        profissionais={new Map(equipa.map((p) => [p.id, p.nome_apresentado]))}
        selos={
          tem("fidelizacao_selos")
            ? { saldo: selos, necessarios: b.selos_necessarios, movimentos }
            : null
        }
        subscricoes={tem("clube_assinatura") ? subscricoes : null}
        pedidos={tem("loja_produtos") ? pedidos : null}
        faltas={faltas}
      />
      {contexto.eGestor && !contexto.apoio && !cliente.anonimizado_em ? (
        <AnonimizarCliente id={id} />
      ) : null}
    </PainelEquipa>
  );
}
