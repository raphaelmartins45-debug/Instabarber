"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

/** «Sair»: termina a sessão e o browser volta à entrada certa para o endereço. */
export function BotaoSair({ acao }: { acao: () => Promise<{ destino: string }> }) {
  const [aSair, iniciar] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      className="border-white/30 bg-transparent text-white"
      disabled={aSair}
      onClick={() => iniciar(async () => window.location.assign((await acao()).destino))}
    >
      {textos.paineis.sair}
    </Button>
  );
}
