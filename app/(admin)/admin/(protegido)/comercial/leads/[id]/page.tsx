import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioLead } from "@/components/admin/comercial/formulario-lead";
import { HistoricoLead } from "@/components/admin/comercial/historico-lead";
import { MudarEstadoLead } from "@/components/admin/comercial/mudar-estado-lead";
import { RegistarEventoLead } from "@/components/admin/comercial/registar-evento-lead";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { Secao } from "@/components/nucleo/secao";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { eventosDoLead, obterLead } from "@/lib/repositorios/comercial/leads";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { DadosLead } from "@/lib/validacao/comercial";

const t = textos.comercial;
export const metadata = { title: `${t.separadores.leads} · ${t.titulo}` };

/** Ficha do lead (N.3): dados, estado, registar contacto e o histórico. */
export default async function FichaLead({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bd = await criarClienteServidor();
  const lead = await obterLead(bd, id);
  if (!lead) notFound();
  const eventos = await eventosDoLead(bd, id);
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
          <Secao id="lead-historico" titulo={t.ficha.historico}>
            <HistoricoLead eventos={eventos} />
          </Secao>
        </div>
        <div className="grid content-start gap-5">
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
