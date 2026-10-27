"use client";

import { useState, useTransition } from "react";
import { enviarGuia } from "@/app/(admin)/admin/(protegido)/documentos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.documentos.ecra;

/** Reenvia o guia de arranque ao proprietário por e-mail, com o PDF em anexo (D-181). */
export function EnviarGuia({ inquilinoId }: { inquilinoId: string }) {
  const [ok, setOk] = useState<boolean>();
  const [aEnviar, iniciar] = useTransition();
  return (
    <div className="grid gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={aEnviar}
        onClick={() => iniciar(async () => setOk((await enviarGuia(inquilinoId)).ok))}
      >
        {t.enviarGuia}
      </Button>
      {ok === undefined ? null : (
        <Aviso tipo={ok ? "sucesso" : "erro"}>{ok ? t.guiaEnviado : t.guiaNaoEnviado}</Aviso>
      )}
    </div>
  );
}
