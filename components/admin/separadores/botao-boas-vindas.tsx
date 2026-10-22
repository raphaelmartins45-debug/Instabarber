"use client";

import { useState, useTransition } from "react";
import { reenviarBoasVindasDono } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

/** Reenvia as boas-vindas ao proprietário, com uma ligação nova para a palavra-passe. */
export function BotaoBoasVindas({ inquilinoId }: { inquilinoId: string }) {
  const [estado, setEstado] = useState<"enviado" | "erro">();
  const [aEnviar, iniciar] = useTransition();
  if (estado === "enviado")
    return <p className="text-sm text-sucesso">{textos.admin.ficha.equipa.boasVindasEnviadas}</p>;
  return (
    <div className="grid gap-1">
      <Button
        variant="outline"
        className="h-11 justify-self-start"
        disabled={aEnviar}
        onClick={() =>
          iniciar(async () =>
            setEstado((await reenviarBoasVindasDono(inquilinoId)).ok ? "enviado" : "erro"),
          )
        }
      >
        {textos.admin.ficha.equipa.reenviarBoasVindas}
      </Button>
      {estado === "erro" ? (
        <p className="text-sm text-destructive">{textos.comum.erroGuardar}</p>
      ) : null}
    </div>
  );
}
