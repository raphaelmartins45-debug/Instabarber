"use client";

import { useTransition } from "react";
import { terminarApoio } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.ficha.apoio;

/** Faixa visível da vista de apoio (E.1): só leitura, com a hora a que termina. */
export function FaixaApoio({ barbearia, hora }: { barbearia: string; hora: string }) {
  const [aSair, iniciar] = useTransition();
  return (
    <div
      role="status"
      data-testid="faixa-apoio"
      className="flex flex-wrap items-center justify-between gap-2 bg-destaque px-4 py-2 text-sm font-semibold text-primary"
    >
      <span>{t.faixa(barbearia, hora)}</span>
      <Button
        size="sm"
        variant="outline"
        className="border-primary/40 bg-transparent"
        disabled={aSair}
        onClick={() => iniciar(async () => window.location.assign((await terminarApoio()).destino))}
      >
        {t.sair}
      </Button>
    </div>
  );
}
