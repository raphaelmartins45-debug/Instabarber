"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoSemNumero } from "@/lib/regras/whatsapp";

const t = textos.vendas;

/**
 * Copiar o texto ou abri-lo no WhatsApp, sem número: a pessoa escolhe o contacto (regra 7).
 * «Copiado» confirma no próprio botão e volta ao normal ao fim de dois segundos.
 */
export function AcoesTexto({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    if (!copiado) return;
    const tempo = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(tempo);
  }, [copiado]);
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
        {copiado ? <Check /> : <Copy />}
        <span aria-live="polite">{copiado ? t.copiado : t.copiar}</span>
      </Button>
      <Button asChild size="sm">
        <a href={ligacaoSemNumero(texto)} target="_blank" rel="noreferrer">
          <MessageCircle />
          {t.whatsapp}
        </a>
      </Button>
    </div>
  );
}
