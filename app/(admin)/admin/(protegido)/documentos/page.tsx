import Link from "next/link";
import { ContratosLead } from "@/components/admin/comercial/contratos-lead";
import { ListaPropostas } from "@/components/admin/comercial/lista-propostas";
import { DocumentosBarbearia } from "@/components/admin/documentos/documentos-barbearia";
import { Escolher } from "@/components/admin/documentos/escolher";
import { FolhetoVisita } from "@/components/admin/documentos/folheto-visita";
import { Secao } from "@/components/nucleo/secao";
import { Button } from "@/components/ui/button";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { listarBarbearias } from "@/lib/repositorios/admin/barbearias";
import { contratosDoLead } from "@/lib/repositorios/comercial/contratos";
import { listarLeads, obterLead } from "@/lib/repositorios/comercial/leads";
import {
  lerBriefing,
  modeloAprovado,
  propostasDoLead,
} from "@/lib/repositorios/comercial/propostas";
import { perfilDePlataforma } from "@/lib/repositorios/perfis";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.documentos;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

const UUID = /^[0-9a-f-]{36}$/i;
const valido = (v: string | undefined) => (v && UUID.test(v) ? v : null);

/**
 * Gerador de documentos (D-181): propostas e contratos de um lead (o comercial, só dos seus, pelo
 * RLS) e, para os administradores, os documentos personalizados de cada barbearia.
 */
export default async function GeradorDeDocumentos({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string; barbearia?: string }>;
}) {
  const quem = await exigirEquipaPlataforma();
  const admin = eAdministrador(quem.papel);
  const p = await searchParams;
  const [leadId, inquilinoId] = [valido(p.lead), valido(p.barbearia)];
  const bd = await criarClienteServidor();
  const [leads, barbearias, lead, eu] = await Promise.all([
    listarLeads(bd),
    admin ? listarBarbearias(bd) : [],
    leadId ? obterLead(bd, leadId) : null,
    perfilDePlataforma(bd, quem.userId),
  ]);
  const [propostas, contratos, briefing, modelo] = lead
    ? await Promise.all([
        propostasDoLead(bd, lead.id),
        contratosDoLead(bd, lead.id),
        lerBriefing(bd, lead.id),
        modeloAprovado(bd, "contrato"),
      ])
    : [[], [], null, null];
  return (
    <section className="grid gap-8">
      <header className="grid gap-1">
        <h1 className="text-[22px] font-extrabold tracking-tight">{t.titulo}</h1>
        <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      </header>
      <Secao id="documentos-lead" titulo={t.ecra.leadTitulo}>
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">{t.ecra.leadAjuda}</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Escolher
              nome="lead"
              rotulo={t.ecra.lead}
              atual={lead?.id ?? null}
              manter={{ barbearia: inquilinoId }}
              opcoes={leads.map((l) => ({
                id: l.id,
                rotulo: l.nome_barbearia
                  ? `${l.nome_barbearia} · ${l.nome_contacto}`
                  : l.nome_contacto,
              }))}
            />
            <Button asChild>
              <Link href="/admin/documentos/proposta">{t.ecra.novoLead}</Link>
            </Button>
          </div>
          {lead && briefing ? (
            <div className="grid gap-5" data-testid="documentos-do-lead">
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/comercial/leads/${lead.id}/briefing`}>{t.ecra.briefing}</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/admin/comercial/leads/${lead.id}`}>{t.ecra.fichaLead}</Link>
                </Button>
              </div>
              <ListaPropostas lead={lead} propostas={propostas} />
              <ContratosLead
                lead={lead}
                briefing={briefing}
                propostas={propostas}
                contratos={contratos}
                haModelo={!!modelo}
              />
            </div>
          ) : null}
        </div>
      </Secao>
      <Secao id="folheto" titulo={t.ecra.folhetoTitulo}>
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">{t.ecra.folhetoAjuda}</p>
          <FolhetoVisita telefone={eu?.telefone ?? null} />
        </div>
      </Secao>
      {admin ? (
        <Secao id="documentos-barbearia" titulo={t.ecra.barbeariaTitulo}>
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">{t.ecra.barbeariaAjuda}</p>
            <Escolher
              nome="barbearia"
              rotulo={t.ecra.barbearia}
              atual={inquilinoId}
              manter={{ lead: leadId }}
              opcoes={barbearias
                .filter((b) => !b.demonstracao)
                .map((b) => ({ id: b.id, rotulo: b.nome }))}
            />
            {inquilinoId ? <DocumentosBarbearia inquilinoId={inquilinoId} /> : null}
          </div>
        </Secao>
      ) : null}
    </section>
  );
}
