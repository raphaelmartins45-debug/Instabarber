"use client";

import { useTransition } from "react";
import { traduzirServicoAcao } from "@/app/(app)/app/(painel)/sistema/acoes-traducao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import type { ServicoTraduzido } from "@/lib/traducao";

const t = textos.sistema;

/** «Traduzir automaticamente» (D-176): pede ao DeepL o inglês e o francês e devolve-os ao formulário. */
export function BotaoTraduzir({
  nome,
  descricao,
  aoTraduzir,
  aoFalhar,
}: {
  nome: string;
  descricao: string;
  aoTraduzir: (traducao: ServicoTraduzido) => void;
  aoFalhar: (texto: string) => void;
}) {
  const [aTraduzir, iniciar] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-10 justify-self-start sm:col-span-2"
      disabled={aTraduzir || !nome.trim()}
      data-testid="traduzir-servico"
      onClick={() =>
        iniciar(async () => {
          const r = await traduzirServicoAcao({ nome, descricao });
          if (r.ok) aoTraduzir(r.traducao);
          else aoFalhar(t.erros[r.erro] ?? t.erros.erro!);
        })
      }
    >
      {aTraduzir ? t.servicos.aTraduzir : t.servicos.traduzir}
    </Button>
  );
}
