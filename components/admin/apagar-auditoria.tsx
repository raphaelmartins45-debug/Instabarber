"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apagarAuditoria } from "@/app/(admin)/admin/(protegido)/acoes-auditoria";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.painel;

/** Rotina mensal (P-24): apagar a auditoria com mais de 24 meses, com confirmação. */
export function ApagarAuditoria() {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aCorrer, iniciar] = useTransition();
  const apagar = () =>
    iniciar(async () => {
      const r = await apagarAuditoria();
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.auditoriaApagada(r.n) }
          : { tipo: "erro", texto: t.erroGenerico },
      );
      router.refresh();
    });
  return (
    <div className="grid gap-2">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <ConfirmarAcao
        titulo={t.apagarAuditoriaTitulo}
        descricao={t.apagarAuditoriaTexto}
        confirmar={t.apagarAuditoria}
        aoConfirmar={apagar}
      >
        <Button variant="ghost" size="sm" disabled={aCorrer} className="justify-self-start">
          {t.apagarAuditoria}
        </Button>
      </ConfirmarAcao>
    </div>
  );
}
