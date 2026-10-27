import { notFound } from "next/navigation";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { NavSeccoes } from "@/components/barbearia/sistema/nav-seccoes";
import { SeccaoAusencias } from "@/components/barbearia/sistema/seccao-ausencias";
import { SeccaoCartoes } from "@/components/barbearia/sistema/seccao-cartoes";
import { SeccaoClube } from "@/components/barbearia/sistema/seccao-clube";
import { SeccaoEquipa } from "@/components/barbearia/sistema/seccao-equipa";
import { SeccaoMarca } from "@/components/barbearia/sistema/seccao-marca";
import { SeccaoOrfas } from "@/components/barbearia/sistema/seccao-orfas";
import { SeccaoPromocoes } from "@/components/barbearia/sistema/seccao-promocoes";
import { SeccaoPeriodos } from "@/components/barbearia/sistema/seccao-periodos";
import { SeccaoServicos } from "@/components/barbearia/sistema/seccao-servicos";
import { FormularioFicha } from "@/components/nucleo/formulario-ficha";
import { valoresDe } from "@/lib/admin/ficha";
import { exigirGestor } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { camposSistema } from "@/lib/painel/campos-sistema";
import { seccoesAtivas } from "@/lib/painel/sistema";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { SeccaoComFormulario } from "@/lib/validacao/sistema";
import { vertical } from "@/lib/vertical/barbearia";
import { guardarSeccao } from "../acoes-configuracao";

export const metadata = { title: `${textos.sistema.titulo} · ${vertical.camadas.gestao}` };

const FORMULARIOS: Record<string, SeccaoComFormulario> = {
  estado: "estado",
  horario: "sistema_horario",
  fidelizacao: "fidelizacao",
  aniversario: "aniversario",
  faltas: "faltas",
  ligacoes: "ligacoes",
};

/**
 * Gestão do sistema, só o gestor (E.2): a única forma de alterar a configuração da barbearia.
 * O barbeiro não entra, nem pelo menu nem por endereço direto. Cada secção só existe com a
 * funcionalidade ativa.
 */
export default async function SeccaoSistema({
  params,
  searchParams,
}: {
  params: Promise<{ seccao: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const contexto = await exigirGestor();
  const { seccao } = await params;
  const inq = contexto.barbearia.id;
  const grelha = await lerGrelha(inq);
  const seccoes = seccoesAtivas(grelha);
  if (!seccoes.some((s) => s.id === seccao) || seccao === "loja") notFound();
  const bd = await criarClienteServidor();
  const so = !!contexto.apoio;

  let conteudo: React.ReactNode;
  const formulario = FORMULARIOS[seccao];
  if (formulario) {
    const [b, servicos] = await Promise.all([obterConfiguracao(bd, inq), listarServicos(bd, inq)]);
    const campos = camposSistema(formulario, servicos);
    conteudo = (
      <FormularioFicha
        key={seccao}
        esquema={formulario}
        campos={campos}
        valores={valoresDe(b, campos)}
        guardar={guardarSeccao}
      />
    );
  } else if (seccao === "marca") conteudo = <SeccaoMarca inquilinoId={inq} />;
  else if (seccao === "ausencias") conteudo = <SeccaoAusencias inquilinoId={inq} />;
  else if (seccao === "equipa")
    conteudo = <SeccaoEquipa inquilinoId={inq} escolhido={(await searchParams).p} />;
  else if (seccao === "servicos")
    conteudo = (
      <SeccaoServicos inquilinoId={inq} multilinguagem={grelha.ativas.has("multilinguagem")} />
    );
  else if (seccao === "clube") conteudo = <SeccaoClube inquilinoId={inq} />;
  else if (seccao === "promocoes") conteudo = <SeccaoPromocoes inquilinoId={inq} />;
  else if (seccao === "periodos") conteudo = <SeccaoPeriodos inquilinoId={inq} />;
  else if (seccao === "cartoes")
    conteudo = <SeccaoCartoes inquilinoId={inq} barbearia={contexto.barbearia.nome} />;
  else conteudo = <SeccaoOrfas inquilinoId={inq} />;

  return (
    <PainelGestor atual="sistema">
      <h1 className="text-[22px] font-extrabold">{textos.sistema.titulo}</h1>
      <NavSeccoes seccoes={seccoes} atual={seccao} />
      <h2 className="text-[15px] font-bold">{textos.sistema.secoes[seccao]}</h2>
      {so ? (
        <p className="text-sm text-muted-foreground">{textos.admin.ficha.apoio.soLeitura}</p>
      ) : null}
      {conteudo}
    </PainelGestor>
  );
}
