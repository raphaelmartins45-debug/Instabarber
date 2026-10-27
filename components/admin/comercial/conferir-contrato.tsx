"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  aprovarCarregado,
  recusarCarregado,
  verCarregado,
} from "@/app/(admin)/admin/(protegido)/comercial/acoes-envio-contrato";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.contratoCliente.equipa;

/**
 * Conferir o contrato que o cliente carregou (D-181): ver o PDF, aprovar (assina, cria o convite
 * e agradece ao cliente) ou recusar com o motivo (o cliente recebe uma ligação nova).
 */
export function ConferirContrato({
  leadId,
  id,
  hoje,
}: {
  leadId: string;
  id: string;
  hoje: string;
}) {
  const router = useRouter();
  const caminho = usePathname();
  const parametros = useSearchParams();
  const [data, setData] = useState(hoje);
  const [motivo, setMotivo] = useState("");
  const [aRecusar, setARecusar] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string }>();
  const [aCorrer, iniciar] = useTransition();
  const concluir = (ok: boolean, texto: string) => setAviso({ ok, texto });
  /** A decisão muda o estado do contrato: o aviso segue no endereço (AvisoContrato). */
  const decidido = (aviso: string) => {
    const p = new URLSearchParams(parametros);
    p.set("aviso_contrato", aviso);
    router.replace(`${caminho}?${p}`, { scroll: false });
  };
  return (
    <div
      className="grid gap-3 rounded-xl border border-destaque/50 p-4"
      data-testid="conferir-contrato"
    >
      <p className="text-sm font-semibold">{t.porConferir}</p>
      {aviso ? <Aviso tipo={aviso.ok ? "sucesso" : "erro"}>{aviso.texto}</Aviso> : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="justify-self-start"
        onClick={() =>
          iniciar(async () => {
            const url = await verCarregado(leadId, id);
            if (url) window.open(url, "_blank", "noopener");
            else concluir(false, t.erro);
          })
        }
      >
        {t.ver}
      </Button>
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-44">
          <Campo
            id={`conferir-data-${id}`}
            rotulo={t.data}
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <Button
          type="button"
          className="h-11"
          disabled={aCorrer}
          onClick={() =>
            iniciar(async () => {
              const r = await aprovarCarregado(leadId, id, data);
              if (r.ok) decidido(r.email ? "aprovado" : "aprovado_sem_email");
              else concluir(false, t.erro);
            })
          }
        >
          {t.aprovar}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={() => setARecusar(!aRecusar)}
        >
          {t.recusar}
        </Button>
      </div>
      {aRecusar ? (
        <div className="grid gap-2">
          <label htmlFor={`recusa-${id}`} className="rotulo">
            {t.motivo}
          </label>
          <textarea
            id={`recusa-${id}`}
            rows={2}
            maxLength={400}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="rounded-md border border-input bg-foreground/[.03] px-3 py-2 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            className="justify-self-start"
            disabled={aCorrer || !motivo.trim()}
            onClick={() =>
              iniciar(async () => {
                const r = await recusarCarregado(leadId, id, motivo);
                if (r.ok) decidido("recusado");
                else concluir(false, t.erro);
              })
            }
          >
            {t.confirmarRecusa}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
