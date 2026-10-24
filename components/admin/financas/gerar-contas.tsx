"use client";

import { gerarContasDoProximoMes } from "@/app/(admin)/admin/(protegido)/financas/acoes";
import { textos } from "@/lib/i18n/pt-PT";
import { BotaoAcao } from "./botao-acao";

/** «Gerar as contas do próximo mês» (O.4), com quantas foram geradas. */
export function GerarContas() {
  return (
    <BotaoAcao
      rotulo={textos.financas.contas.gerar}
      acao={gerarContasDoProximoMes}
      sucesso={textos.financas.contas.geradas}
    />
  );
}
