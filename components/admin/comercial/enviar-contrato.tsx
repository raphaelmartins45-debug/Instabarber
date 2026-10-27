"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { enviarAoCliente } from "@/app/(admin)/admin/(protegido)/comercial/acoes-envio-contrato";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.contratoCliente.equipa;

/** Envia o contrato ao cliente por e-mail, com o PDF e a ligação para o carregar assinado. */
export function EnviarContrato({
  leadId,
  id,
  email,
  enviadoEm,
}: {
  leadId: string;
  id: string;
  email: string | null;
  enviadoEm: string | null;
}) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string }>();
  const [aEnviar, iniciar] = useTransition();
  if (!email) return <p className="text-sm text-muted-foreground">{t.semEmail}</p>;
  return (
    <div className="grid gap-2" data-testid="enviar-contrato">
      {enviadoEm ? (
        <p className="text-sm text-muted-foreground">{t.enviadoEm(dataCurta(enviadoEm))}</p>
      ) : null}
      <Button
        type="button"
        size="sm"
        className="justify-self-start"
        disabled={aEnviar}
        onClick={() =>
          iniciar(async () => {
            const r = await enviarAoCliente(leadId, id);
            setAviso({ ok: r.ok, texto: r.ok ? t.enviado(email) : t.erroEnvio });
            if (r.ok) router.refresh();
          })
        }
      >
        {enviadoEm ? t.reenviar : t.enviar}
      </Button>
      {aviso ? <Aviso tipo={aviso.ok ? "sucesso" : "erro"}>{aviso.texto}</Aviso> : null}
    </div>
  );
}
