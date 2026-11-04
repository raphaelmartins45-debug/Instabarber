"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  type DemoMarcada,
  marcarDemonstracao,
} from "@/app/(admin)/admin/(protegido)/comercial/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.marcarDemo;

/**
 * Marcar a demonstração (D-211): o dia e a hora. O lead passa a «Demo marcada» e recebe a
 * confirmação por e-mail; fica pronta a mensagem do WhatsApp.
 */
export function MarcarDemoLead({
  id,
  quando,
  hoje,
}: {
  id: string;
  /** A demonstração já marcada, por extenso. */
  quando: string | null;
  hoje: string;
}) {
  const router = useRouter();
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [r, setR] = useState<DemoMarcada>();
  const [aGuardar, iniciar] = useTransition();
  const marcar = () =>
    iniciar(async () => {
      const res = await marcarDemonstracao(id, { data, hora });
      setR(res);
      if (res.ok) router.refresh();
    });
  return (
    <div className="grid gap-3" data-testid="marcar-demo">
      {quando ? <p className="text-sm font-semibold">{t.marcada(quando)}</p> : null}
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1.5">
          <span className="rotulo">{t.data}</span>
          <input
            type="date"
            min={hoje}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="h-11 rounded-md border bg-card px-3 text-sm"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="rotulo">{t.hora}</span>
          <input
            type="time"
            step={900}
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="h-11 rounded-md border bg-card px-3 text-sm"
          />
        </label>
      </div>
      <Button type="button" className="h-11" disabled={aGuardar || !data || !hora} onClick={marcar}>
        {quando ? t.remarcar : t.marcar}
      </Button>
      {r && !r.ok ? <Aviso tipo="erro">{t.erros[r.erro] ?? t.erros.generico}</Aviso> : null}
      {r?.ok ? (
        <Aviso tipo={r.email === "enviado" ? "sucesso" : "erro"}>
          {r.email === "enviado" && r.para
            ? t.emailEnviado(r.para)
            : r.email === "falhou"
              ? t.emailFalhou
              : t.semEmail}
        </Aviso>
      ) : null}
      {r?.ok && r.whatsapp ? (
        <Button asChild variant="outline" className="h-11">
          <a href={r.whatsapp} target="_blank" rel="noopener">
            <MessageCircle aria-hidden className="size-4" />
            {t.whatsapp}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
