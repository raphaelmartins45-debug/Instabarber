"use client";

import { useTransition } from "react";
import { paguei } from "@/app/(app)/app/(painel)/financeiro/acoes";
import { Button } from "@/components/ui/button";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Conta } from "@/lib/repositorios/painel/financeiro";

const t = textos.inicio;

/** Contas a pagar por pagar, com «Paguei» (E.2). */
export function ContasPendentes({ contas }: { contas: Conta[] }) {
  const [aGuardar, iniciar] = useTransition();
  if (contas.length === 0) return <p className="text-sm text-muted-foreground">{t.contasVazio}</p>;
  return (
    <ul className="grid gap-2">
      {contas.map((c) => (
        <li
          key={`${c.tipo}-${c.id}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
        >
          <span>
            <span className="font-semibold">{c.descricao}</span>
            <span className="text-muted-foreground"> · {dataCurta(`${c.data}T12:00:00Z`)}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="font-semibold tabular-nums">{formatarDinheiro(c.valorCent)}</span>
            <Button
              size="sm"
              variant="outline"
              className="h-10"
              disabled={aGuardar}
              onClick={() => iniciar(async () => void (await paguei(c.tipo, c.id)))}
            >
              {t.paguei}
            </Button>
          </span>
        </li>
      ))}
    </ul>
  );
}
