"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registarComissao } from "@/app/(admin)/admin/(protegido)/comercial/acoes-comissoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.comissoes;

/** Registar que a taxa foi paga ou que a comissão foi paga, com a data (D-162). */
export function AcoesComissao({
  id,
  passo,
  hoje,
}: {
  id: string;
  passo: "taxa" | "paga";
  hoje: string;
}) {
  const router = useRouter();
  const [data, setData] = useState(hoje);
  const [erro, setErro] = useState(false);
  const [aGuardar, iniciar] = useTransition();
  const rotulo = passo === "taxa" ? t.taxaPaga : t.comissaoPaga;
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="grid gap-1">
        <span className="rotulo">{rotulo}</span>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          aria-label={rotulo}
          className="h-9 rounded-md border border-input bg-card px-2 text-sm"
        />
      </label>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={aGuardar || !data}
        onClick={() =>
          iniciar(async () => {
            const r = await registarComissao(id, passo, data);
            setErro(!r.ok);
            if (r.ok) router.refresh();
          })
        }
      >
        {passo === "taxa" ? t.registarTaxa : t.marcarPaga}
      </Button>
      {erro ? <span className="text-sm text-destructive">{t.erro}</span> : null}
    </div>
  );
}
