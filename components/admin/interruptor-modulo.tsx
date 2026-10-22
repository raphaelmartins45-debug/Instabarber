"use client";

import { useState, useTransition } from "react";
import {
  interruptorBarbearia,
  interruptorGeral,
} from "@/app/(admin)/admin/(protegido)/modulos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.modulos;

/** Liga ou desliga um módulo (G.4), geral ou de uma barbearia, com confirmação. */
export function InterruptorModulo({
  modulo,
  ativo,
  inquilinoId,
  rotulo,
}: {
  modulo: string;
  ativo: boolean;
  /** Sem barbearia, é o interruptor geral. */
  inquilinoId?: string;
  rotulo: string;
}) {
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const alternar = () =>
    iniciar(async () => {
      const r: { ok: boolean; emFalta?: string[] } = inquilinoId
        ? await interruptorBarbearia(inquilinoId, modulo, !ativo)
        : await interruptorGeral(modulo, !ativo);
      const emFalta = r.emFalta;
      setErro(r.ok ? undefined : emFalta?.length ? t.emFalta(emFalta.join(", ")) : t.erro);
    });
  return (
    <div className="grid justify-items-start gap-2">
      <ConfirmarAcao
        titulo={`${ativo ? t.desligar : t.ligar}: ${rotulo}`}
        descricao={t.auditoria}
        confirmar={ativo ? t.desligar : t.ligar}
        aoConfirmar={alternar}
      >
        <Button
          variant={ativo ? "default" : "outline"}
          size="sm"
          className="h-10"
          disabled={aGuardar}
          aria-pressed={ativo}
          data-testid={`interruptor-${modulo}${inquilinoId ? `-${inquilinoId}` : ""}`}
        >
          {ativo ? t.ligado : t.desligado}
        </Button>
      </ConfirmarAcao>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
    </div>
  );
}
