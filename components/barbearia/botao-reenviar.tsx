"use client";

import { useState, useTransition } from "react";
import { reenviarConviteBarbeiro } from "@/app/(app)/app/(painel)/sistema/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

/** «Reenviar convite» para o barbeiro que não entrou em 24 horas (E.3). */
export function BotaoReenviar({ profissionalId }: { profissionalId: string }) {
  const [feito, setFeito] = useState(false);
  const [aEnviar, iniciar] = useTransition();
  if (feito) return <span className="text-sm text-sucesso">{textos.paineis.equipa.reenviado}</span>;
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={aEnviar}
      onClick={() =>
        iniciar(async () => setFeito((await reenviarConviteBarbeiro(profissionalId)).ok))
      }
    >
      {textos.paineis.equipa.reenviar}
    </Button>
  );
}
