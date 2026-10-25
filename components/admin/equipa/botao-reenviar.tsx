"use client";

import { reenviar } from "@/app/(admin)/admin/(protegido)/equipa/acoes";
import { BotaoAcao } from "@/components/admin/financas/botao-acao";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.gestao.equipa;

/** Reenvia o convite a quem ainda não entrou, com a confirmação no ecrã. */
export function BotaoReenviar({ perfilId }: { perfilId: string }) {
  return (
    <BotaoAcao
      rotulo={t.reenviar}
      variante="ghost"
      acao={() => reenviar(perfilId)}
      sucesso={() => t.reenviado}
    />
  );
}
