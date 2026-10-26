import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioBriefing } from "@/components/admin/comercial/formulario-briefing";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { centimosDeNumeric, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { obterLead } from "@/lib/repositorios/comercial/leads";
import { lerCondicoes } from "@/lib/repositorios/comercial/condicoes";
import { lerBriefing } from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial;
export const metadata = { title: `${t.briefing.titulo} · ${t.titulo}` };

/** Briefing do lead (N.4). Começa com o que o lead já tem, incluindo a ficha de prospeção (D-174). */
export default async function Briefing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quem = await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const lead = await obterLead(bd, id);
  if (!lead) notFound();
  const [b, condicoes] = await Promise.all([lerBriefing(bd, id), lerCondicoes(bd)]);
  const inicial = {
    ...b,
    nome_comercial: b.nome_comercial || lead.nome_barbearia || "",
    cidade: b.cidade || lead.cidade || "",
    morada: b.morada || lead.morada || "",
    cadeiras: b.cadeiras ?? lead.cadeiras ?? undefined,
    n_barbeiros: b.n_barbeiros ?? (Number(lead.n_barbeiros) || undefined),
    como_marcam: b.como_marcam.length
      ? b.como_marcam
      : lead.como_marcam
        ? [lead.como_marcam as (typeof b.como_marcam)[number]]
        : [],
    sistema_atual: b.sistema_atual || lead.sistema_atual || "",
    custo_sistema:
      b.custo_sistema ||
      (lead.custo_atual === null ? "" : textoDeCentimos(centimosDeNumeric(lead.custo_atual))),
    decisor_cargo: b.decisor_cargo || (lead.fala_com_decisor ? lead.contacto_cargo || "" : ""),
    decisor_nome: b.decisor_nome || lead.nome_contacto,
    decisor_email: b.decisor_email || lead.email || "",
    decisor_telemovel: b.decisor_telemovel || lead.telefone || "",
  };
  return (
    <div className="grid gap-4">
      <Link href={`/admin/comercial/leads/${id}`} className="text-sm text-ligacao underline">
        {lead.nome_barbearia || lead.nome_contacto}
      </Link>
      <h2 className="text-lg font-bold">{t.briefing.titulo}</h2>
      <FormularioBriefing
        leadId={id}
        inicial={inicial}
        regime={lerRegimeIva(process.env.PRESTADORA_REGIME_IVA)}
        condicoes={condicoes}
        administrador={eAdministrador(quem.papel)}
      />
    </div>
  );
}
