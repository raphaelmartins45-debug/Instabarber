"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.demonstracao;

/**
 * O código de acesso da reunião (D-208): aparece logo depois de «Gerar» ou de «Novo código»
 * (a base de dados só guarda o hash, por isso não se volta a mostrar).
 */
export function CodigoDemonstracao({
  codigo,
  aCorrer,
  onNovo,
}: {
  codigo: string | null;
  aCorrer: boolean;
  onNovo: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="grid gap-3 rounded-xl border bg-accent/40 p-4" data-testid="demo-codigo-admin">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold">
          <KeyRound aria-hidden className="size-4 text-destaque" />
          {t.codigo}
        </span>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={aCorrer}
          onClick={onNovo}
        >
          {t.novoCodigo}
        </Button>
      </div>
      {codigo ? (
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="numero text-3xl font-extrabold tracking-[0.3em]"
            data-testid="demo-codigo-valor"
          >
            {codigo}
          </span>
          <Button
            type="button"
            variant="ghost"
            className="h-10"
            onClick={() => {
              void navigator.clipboard?.writeText(codigo);
              setCopiado(true);
            }}
          >
            {copiado ? (
              <Check aria-hidden className="size-4" />
            ) : (
              <Copy aria-hidden className="size-4" />
            )}
            {copiado ? t.copiado : t.copiar}
          </Button>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">{codigo ? t.codigoAjuda : t.codigoEscondido}</p>
    </div>
  );
}
