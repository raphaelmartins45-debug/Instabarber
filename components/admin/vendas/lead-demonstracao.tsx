"use client";

import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.demonstracao;

export type LeadOpcao = { id: string; barbearia: string; contacto: string; cidade: string | null };

/**
 * O lead da apresentação (D-209): ao escolher, o nome e a cidade da barbearia passam para o
 * formulário; ao gerar, o convite segue para o e-mail do lead.
 */
export function LeadDemonstracao({
  leads,
  onEscolher,
}: {
  leads: LeadOpcao[];
  onEscolher: (lead: LeadOpcao | null) => void;
}) {
  return (
    <label className="grid gap-1.5 md:col-span-2">
      <span className="rotulo">{t.lead}</span>
      <select
        name="lead"
        defaultValue=""
        onChange={(e) => onEscolher(leads.find((l) => l.id === e.target.value) ?? null)}
        className="h-11 rounded-md border bg-card px-3 text-sm"
        data-testid="demo-lead"
      >
        <option value="">{t.leadNenhum}</option>
        {leads.map((l) => (
          <option key={l.id} value={l.id}>
            {l.barbearia} · {l.contacto}
            {l.cidade ? ` · ${l.cidade}` : ""}
          </option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground">{t.leadAjuda}</span>
    </label>
  );
}
