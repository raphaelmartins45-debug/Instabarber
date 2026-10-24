import { FormularioLead } from "@/components/admin/comercial/formulario-lead";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial;
export const metadata = { title: `${t.leads.novo} · ${t.titulo}` };

/** Lead criado à mão: contacto por WhatsApp, e-mail, indicação ou visita (N.3). */
export default function NovoLead() {
  return (
    <div className="grid gap-4">
      <h2 className="text-base font-semibold">{t.leads.novo}</h2>
      <FormularioLead />
    </div>
  );
}
