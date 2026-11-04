"use client";

import { useActionState } from "react";
import { entrarComCodigo, type EstadoCodigo } from "@/app/demo/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.demonstracao;

/** O código da reunião (D-208): seis algarismos; só depois aparecem as três vistas. */
export function EntrarCodigo() {
  const [estado, acao, aCorrer] = useActionState<EstadoCodigo, FormData>(entrarComCodigo, {});
  return (
    <form
      action={acao}
      className="cartao grid w-full max-w-md grid-cols-[minmax(0,1fr)] gap-4 rounded-2xl p-6"
      data-testid="demo-codigo"
    >
      <p className="text-sm text-muted-foreground">{t.pedirCodigo}</p>
      <label className="grid gap-1.5">
        <span className="rotulo">{t.codigo}</span>
        <input
          name="codigo"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          placeholder="000000"
          className="numero h-14 w-full min-w-0 rounded-lg border bg-card px-4 text-center text-2xl font-bold tracking-[0.4em]"
        />
      </label>
      {estado.erro ? (
        <Aviso tipo="erro">{estado.erro === "limite" ? t.codigoLimite : t.codigoErrado}</Aviso>
      ) : null}
      <Button type="submit" className="h-12" disabled={aCorrer}>
        {t.entrarCodigo}
      </Button>
    </form>
  );
}
