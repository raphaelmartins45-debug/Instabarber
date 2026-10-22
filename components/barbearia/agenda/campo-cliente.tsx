"use client";

import { useTransition } from "react";
import { procurarCliente } from "@/app/(app)/app/(painel)/agenda/acoes";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.agenda.balcao;

export type ClienteEncontrado = { id: string; nome: string } | null | undefined;

/** Cliente pelo telemóvel: encontrado, ou novo com nome e consentimento de mensagens. */
export function CampoCliente({
  telefone,
  nome,
  consentimento,
  cliente,
  aoMudar,
  aoEncontrar,
}: {
  telefone: string;
  nome: string;
  consentimento: boolean;
  cliente: ClienteEncontrado;
  aoMudar: (campo: "telefone" | "nome" | "consentimento", valor: string | boolean) => void;
  aoEncontrar: (c: ClienteEncontrado) => void;
}) {
  const [, iniciar] = useTransition();
  const procurar = () => iniciar(async () => aoEncontrar(await procurarCliente(telefone)));
  return (
    <>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Campo
            id="telefone"
            rotulo={t.telefone}
            type="tel"
            inputMode="tel"
            autoComplete="off"
            value={telefone}
            onChange={(e) => (aoMudar("telefone", e.target.value), aoEncontrar(undefined))}
            onBlur={() => telefone && procurar()}
          />
        </div>
        <Button type="button" variant="outline" className="h-11" onClick={procurar}>
          {t.procurar}
        </Button>
      </div>
      {cliente ? (
        <p className="text-sm font-semibold" data-testid="cliente-encontrado">
          {t.encontrado(cliente.nome)}
        </p>
      ) : cliente === null ? (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">{t.novo}</p>
          <Campo
            id="nome"
            rotulo={t.nome}
            value={nome}
            onChange={(e) => aoMudar("nome", e.target.value)}
          />
          <label className="flex min-h-11 items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentimento}
              onChange={(e) => aoMudar("consentimento", e.target.checked)}
            />
            {t.consentimento}
          </label>
        </div>
      ) : null}
    </>
  );
}
