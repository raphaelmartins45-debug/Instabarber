"use client";

import { useState, useTransition } from "react";
import { anonimizar, permitirMarcacaoOnline } from "@/app/(app)/app/(painel)/clientes/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.clientes.ficha;

/** «Voltar a permitir marcação online» (F.8): só aparece quando a política de faltas bloqueou. */
export function PermitirMarcacao({ id }: { id: string }) {
  const [feito, setFeito] = useState(false);
  const [aGuardar, iniciar] = useTransition();
  if (feito) return <Aviso tipo="sucesso">{t.permitido}</Aviso>;
  return (
    <div className="grid gap-2 rounded-lg border border-destaque/40 bg-accent p-3 text-sm">
      <p>{t.bloqueado}</p>
      <Button
        className="h-11 w-full sm:w-auto sm:justify-self-start"
        disabled={aGuardar}
        onClick={() => iniciar(async () => setFeito((await permitirMarcacaoOnline(id)).ok))}
      >
        {t.permitir}
      </Button>
    </div>
  );
}

/** Anonimizar o cliente (direito de eliminação): só o gestor, com confirmação explícita. */
export function AnonimizarCliente({ id }: { id: string }) {
  const [feito, setFeito] = useState(false);
  const [aGuardar, iniciar] = useTransition();
  if (feito) return <Aviso tipo="sucesso">{t.anonimizado}</Aviso>;
  return (
    <ConfirmarAcao
      titulo={t.anonimizarTitulo}
      descricao={t.anonimizarTexto}
      confirmar={t.anonimizar}
      aoConfirmar={() => iniciar(async () => setFeito((await anonimizar(id)).ok))}
    >
      <Button
        variant="outline"
        className="h-11 w-full text-destructive sm:w-auto sm:justify-self-start"
        disabled={aGuardar}
      >
        {t.anonimizar}
      </Button>
    </ConfirmarAcao>
  );
}
