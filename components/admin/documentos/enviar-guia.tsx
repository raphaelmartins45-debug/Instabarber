"use client";

import { useState, useTransition } from "react";
import { enviarGuia } from "@/app/(admin)/admin/(protegido)/documentos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.documentos.ecra;

/** Reenvia o guia de arranque por e-mail, com o PDF em anexo (D-181), e diz para onde foi (D-190). */
export function EnviarGuia({ inquilinoId }: { inquilinoId: string }) {
  const [r, setR] = useState<{ ok: boolean; para?: string }>();
  const [aEnviar, iniciar] = useTransition();
  return (
    <div className="grid gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={aEnviar}
        onClick={() => iniciar(async () => setR(await enviarGuia(inquilinoId)))}
      >
        {t.enviarGuia}
      </Button>
      {r === undefined ? null : (
        <Aviso tipo={r.ok ? "sucesso" : "erro"}>
          {r.ok ? t.guiaEnviado(r.para ?? "") : t.guiaNaoEnviado}
        </Aviso>
      )}
    </div>
  );
}
