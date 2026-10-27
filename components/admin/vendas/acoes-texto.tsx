"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoSemNumero } from "@/lib/regras/whatsapp";

const t = textos.vendas;

/** Copiar o texto ou abri-lo no WhatsApp, sem número: a pessoa escolhe o contacto (regra 7). */
export function AcoesTexto({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(texto).catch(() => undefined);
          setCopiado(true);
        }}
      >
        {t.copiar}
      </Button>
      <Button asChild size="sm">
        <a href={ligacaoSemNumero(texto)} target="_blank" rel="noreferrer">
          {t.whatsapp}
        </a>
      </Button>
      {copiado ? (
        <span role="status" className="text-xs text-muted-foreground">
          {t.copiado}
        </span>
      ) : null}
    </div>
  );
}
