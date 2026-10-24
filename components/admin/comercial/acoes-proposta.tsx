"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { decidir, marcarEnviada } from "@/app/(admin)/admin/(protegido)/comercial/acoes-propostas";
import { DialogoTexto } from "@/components/admin/dialogo-texto";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.propostas;

/**
 * Ações de uma proposta (N.5): o sistema não envia; o operador descarrega, envia pelo WhatsApp
 * ou e-mail com o texto pronto e confirma «enviada». Depois regista a decisão.
 */
export function AcoesProposta({
  leadId,
  id,
  estado,
  whatsapp,
  email,
}: {
  leadId: string;
  id: string;
  estado: string;
  whatsapp: string | null;
  email: string | null;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: boolean; erro?: string }>) =>
    iniciar(async () => {
      const r = await acao();
      if (!r.ok) return setErro(t.erros[r.erro ?? ""] ?? t.erros.generico);
      setErro(undefined);
      router.refresh();
    });

  return (
    <div className="grid gap-2">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={`/admin/comercial/propostas/${id}/pdf`}>{t.descarregar}</a>
        </Button>
        {estado === "rascunho" ? (
          <Button
            size="sm"
            disabled={aGuardar}
            onClick={() => correr(() => marcarEnviada(leadId, id))}
          >
            {t.marcarEnviada}
          </Button>
        ) : null}
        {estado === "rascunho" || estado === "enviada" ? (
          <>
            {whatsapp ? (
              <Button asChild variant="ghost" size="sm">
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  {t.enviarWhatsapp}
                </a>
              </Button>
            ) : null}
            {email ? (
              <Button asChild variant="ghost" size="sm">
                <a href={email}>{t.enviarEmail}</a>
              </Button>
            ) : null}
          </>
        ) : null}
        {estado === "enviada" ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              disabled={aGuardar}
              onClick={() => correr(() => decidir(leadId, id, true))}
            >
              {t.aceitar}
            </Button>
            <DialogoTexto
              titulo={t.recusar}
              descricao={t.motivoRecusa}
              rotulo={t.motivoRecusa}
              confirmar={t.confirmarRecusa}
              minimo={3}
              aoConfirmar={(motivo) => correr(() => decidir(leadId, id, false, motivo))}
            >
              <Button size="sm" variant="ghost" disabled={aGuardar}>
                {t.recusar}
              </Button>
            </DialogoTexto>
          </>
        ) : null}
      </div>
    </div>
  );
}
