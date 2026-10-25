import Link from "next/link";
import { notFound } from "next/navigation";
import { AtribuirResponsavel } from "@/components/admin/comercial/atribuir-responsavel";
import { ContratosLead } from "@/components/admin/comercial/contratos-lead";
import { FormularioLead } from "@/components/admin/comercial/formulario-lead";
import { HistoricoLead } from "@/components/admin/comercial/historico-lead";
import { ListaPropostas } from "@/components/admin/comercial/lista-propostas";
import { MudarEstadoLead } from "@/components/admin/comercial/mudar-estado-lead";
import { RegistarEventoLead } from "@/components/admin/comercial/registar-evento-lead";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { Button } from "@/components/ui/button";
import { Secao } from "@/components/nucleo/secao";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarComerciais } from "@/lib/repositorios/admin/equipa";
import { eventosDoLead, obterLead } from "@/lib/repositorios/comercial/leads";
import { contratosDoLead } from "@/lib/repositorios/comercial/contratos";
import {
  lerBriefing,
  modeloAprovado,
  propostasDoLead,
} from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { DadosLead } from "@/lib/validacao/comercial";

const t = textos.comercial;
export const metadata = { title: `${t.separadores.leads} · ${t.titulo}` };

/** Ficha do lead (N.3): dados, estado, propostas, contratos, registar contacto e o histórico. */
export default async function FichaLead({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = eAdministrador((await exigirEquipaPlataforma()).papel);
  const bd = await criarClienteServidor();
  const lead = await obterLead(bd, id);
  if (!lead) notFound();
  const [eventos, propostas, contratos, briefing, modelo, comerciais] = await Promise.all([
    eventosDoLead(bd, id),
    propostasDoLead(bd, id),
    contratosDoLead(bd, id),
    lerBriefing(bd, id),
    modeloAprovado(bd, "contrato"),
    admin ? listarComerciais(bd) : [],
  ]);
  const inicial: DadosLead = {
    nome_contacto: lead.nome_contacto,
    nome_barbearia: lead.nome_barbearia ?? "",
    cidade: lead.cidade ?? "",
    telefone: lead.telefone ?? "",
    email: lead.email ?? "",
    n_barbeiros: lead.n_barbeiros ?? "",
    origem: lead.origem as DadosLead["origem"],
  };
  return (
    <div className="grid gap-5">
      <Link href="/admin/comercial/leads" className="text-sm text-ligacao underline">
        {t.ficha.voltar}
      </Link>
      <div className="grid gap-1">
        <h2 className="text-lg font-bold" data-testid="lead-nome">
          {lead.nome_barbearia || lead.nome_contacto}
        </h2>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Etiqueta
            tom={
              lead.estado === "ganho" ? "sucesso" : lead.estado === "perdido" ? "neutro" : "info"
            }
          >
            {t.estados[lead.estado]}
          </Etiqueta>
          {t.origens[lead.origem]} · {dataCurta(lead.criado_em)}
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid content-start gap-5">
          <Secao id="lead-dados" titulo={t.ficha.dados}>
            <FormularioLead id={lead.id} inicial={inicial} />
          </Secao>
          <Secao id="propostas" titulo={t.propostas.titulo}>
            <div className="grid gap-3">
              <Button asChild variant="outline" className="justify-self-start">
                <Link href={`/admin/comercial/leads/${lead.id}/briefing`}>{t.briefing.abrir}</Link>
              </Button>
              <ListaPropostas lead={lead} propostas={propostas} />
            </div>
          </Secao>
          <Secao id="contratos" titulo={t.contratos.titulo}>
            <ContratosLead
              lead={lead}
              briefing={briefing}
              propostas={propostas}
              contratos={contratos}
              haModelo={!!modelo}
            />
          </Secao>
          <Secao id="lead-historico" titulo={t.ficha.historico}>
            <HistoricoLead eventos={eventos} />
          </Secao>
        </div>
        <div className="grid content-start gap-5">
          {admin ? (
            <div className="cartao rounded-2xl p-5">
              <AtribuirResponsavel
                leadId={lead.id}
                atual={lead.responsavel_id}
                comerciais={comerciais}
              />
            </div>
          ) : null}
          <Secao id="lead-estado" titulo={t.ficha.mudarEstado}>
            <div className="cartao rounded-2xl p-5">
              <MudarEstadoLead id={lead.id} atual={lead.estado} />
            </div>
          </Secao>
          <Secao id="lead-registar" titulo={t.ficha.registar}>
            <div className="cartao rounded-2xl p-5">
              <RegistarEventoLead id={lead.id} />
            </div>
          </Secao>
        </div>
      </div>
    </div>
  );
}
