import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioBriefing } from "@/components/admin/comercial/formulario-briefing";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { obterLead } from "@/lib/repositorios/comercial/leads";
import { lerBriefing } from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial;
export const metadata = { title: `${t.briefing.titulo} · ${t.titulo}` };

/** Briefing do lead (N.4). Começa com o que o lead já tem (barbearia, cidade, barbeiros). */
export default async function Briefing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bd = await criarClienteServidor();
  const lead = await obterLead(bd, id);
  if (!lead) notFound();
  const b = await lerBriefing(bd, id);
  const inicial = {
    ...b,
    nome_comercial: b.nome_comercial || lead.nome_barbearia || "",
    cidade: b.cidade || lead.cidade || "",
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
      />
    </div>
  );
}
