"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

/** «Sair»: termina a sessão e o browser volta à entrada certa para o endereço. */
export function BotaoSair({
  acao,
  rotulo = textos.paineis.sair,
  className = "border-white/30 bg-transparent text-white",
}: {
  acao: () => Promise<{ destino: string }>;
  /** Na área de cliente, na língua do cliente. */
  rotulo?: string;
  className?: string;
}) {
  const [aSair, iniciar] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled={aSair}
      onClick={() => iniciar(async () => window.location.assign((await acao()).destino))}
    >
      {rotulo}
    </Button>
  );
}
