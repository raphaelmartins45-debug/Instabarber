"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { marcarEnviado } from "@/app/(admin)/admin/(protegido)/comercial/acoes-contratos";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.contratos;

/** Descarregar o PDF e marcar o contrato como enviado (o envio é sempre fora do sistema). */
export function AcoesContrato({
  leadId,
  id,
  estado,
}: {
  leadId: string;
  id: string;
  estado: string;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const enviar = () =>
    iniciar(async () => {
      const r = await marcarEnviado(leadId, id);
      if (!r.ok) return setErro(t.erros[r.erro] ?? t.erros.generico);
      setErro(undefined);
      router.refresh();
    });
  return (
    <div className="grid gap-2">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={`/admin/comercial/contratos/${id}/pdf`}>{t.descarregar}</a>
        </Button>
        {estado === "assinado" ? (
          <Button asChild variant="outline" size="sm">
            <a href={`/admin/comercial/contratos/${id}/assinado`}>{t.descarregarAssinado}</a>
          </Button>
        ) : null}
        {estado === "rascunho" ? (
          <Button size="sm" disabled={aGuardar} onClick={enviar}>
            {t.marcarEnviado}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
