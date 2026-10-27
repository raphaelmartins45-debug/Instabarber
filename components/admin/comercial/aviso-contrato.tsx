"use client";

import { useSearchParams } from "next/navigation";
import { Aviso } from "@/components/nucleo/aviso";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.contratoCliente.equipa;

const AVISOS: Record<string, { ok: boolean; texto: string }> = {
  aprovado: { ok: true, texto: t.aprovado },
  aprovado_sem_email: { ok: false, texto: t.aprovadoSemEmail },
  recusado: { ok: true, texto: t.recusado },
};

/**
 * O resultado de aprovar ou recusar o contrato carregado (D-181). Vem no endereço
 * (`?aviso_contrato=`), porque a decisão muda o estado e o bloco de conferir sai da página.
 */
export function AvisoContrato() {
  const aviso = AVISOS[useSearchParams().get("aviso_contrato") ?? ""];
  return aviso ? <Aviso tipo={aviso.ok ? "sucesso" : "erro"}>{aviso.texto}</Aviso> : null;
}
