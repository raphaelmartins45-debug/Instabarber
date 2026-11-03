"use client";

import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.registo;

export type OpcaoProposta = { id: string; rotulo: string };

/** A lista «Carregar de uma proposta» no topo do registo (D-195). */
export function CarregarProposta({
  propostas,
  aoEscolher,
}: {
  propostas: OpcaoProposta[];
  aoEscolher: (id: string) => void;
}) {
  if (!propostas.length) return null;
  return (
    <label className="cartao grid min-w-0 gap-1.5 rounded-2xl p-4">
      <span className="rotulo">{t.carregarProposta}</span>
      <select
        id="registo-proposta"
        defaultValue=""
        onChange={(e) => aoEscolher(e.target.value)}
        className="h-11 w-full min-w-0 rounded-md border border-input bg-campo px-3 text-sm"
      >
        <option value="">{t.semProposta}</option>
        {propostas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}
