"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { mudarEstado } from "@/app/(admin)/admin/(protegido)/comercial/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { ESTADOS_MANUAIS } from "@/lib/validacao/comercial";

const t = textos.comercial;
type Estado = (typeof ESTADOS_MANUAIS)[number];

/** Mudar o estado do lead (N.3): «perdido» pede motivo; «ganho» só chega ao assinar o contrato. */
export function MudarEstadoLead({ id, atual }: { id: string; atual: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>(
    (ESTADOS_MANUAIS as readonly string[]).includes(atual) ? (atual as Estado) : "contactado",
  );
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();

  if (atual === "ganho")
    return <p className="text-sm text-muted-foreground">{t.ficha.ganhoFinal}</p>;

  const guardar = () =>
    iniciar(async () => {
      const r = await mudarEstado(id, { estado, motivo });
      if (!r.ok) return setErro(t.erros[r.erro] ?? t.erros.generico);
      setErro(undefined);
      setMotivo("");
      router.refresh();
    });

  return (
    <div className="grid gap-3">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <label className="grid gap-1.5">
        <span className="rotulo">{t.ficha.estado}</span>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as Estado)}
          className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
        >
          {ESTADOS_MANUAIS.map((e) => (
            <option key={e} value={e}>
              {t.estados[e]}
            </option>
          ))}
        </select>
      </label>
      {estado === "perdido" ? (
        <label className="grid gap-1.5">
          <span className="rotulo">{t.ficha.motivo}</span>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={2}
            className="rounded-lg border border-input bg-foreground/[.03] p-3 text-sm"
          />
          <span className="text-xs text-muted-foreground">{t.ficha.motivoAjuda}</span>
        </label>
      ) : null}
      <Button
        type="button"
        variant="outline"
        onClick={guardar}
        disabled={aGuardar || estado === atual}
        className="justify-self-start"
      >
        {t.ficha.mudarEstado}
      </Button>
      <p className="text-xs text-terciario">{t.ficha.ganhoSoContrato}</p>
    </div>
  );
}
