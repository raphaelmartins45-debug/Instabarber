"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { lembreteAberto } from "@/app/(app)/app/(painel)/agenda/acoes";
import { mensagemAberta } from "@/app/(app)/app/(painel)/clientes/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import type { ItemLote } from "@/lib/painel/mensagens";

const t = textos.mensagensLote;

/**
 * Mensagens em lote (F.4.10, Pro): uma fila que abre o WhatsApp de um cliente de cada vez, com a
 * mensagem pronta. Cada clique fica registado; o envio confirma-se no WhatsApp (regra 7).
 */
export function FilaMensagens({ itens, titulo }: { itens: ItemLote[]; titulo: string }) {
  const [feitos, setFeitos] = useState(0);
  if (itens.length === 0) return null;
  const seguinte = itens[feitos];
  const registar = (i: ItemLote) =>
    i.tipo === "lembrete" ? lembreteAberto(i.id) : mensagemAberta(i.id, i.tipo, i.conteudo);
  return (
    <section
      className="grid gap-2 rounded-xl border bg-card p-4"
      aria-label={titulo}
      data-testid="fila-mensagens"
    >
      <p className="text-[15px] font-bold">{titulo}</p>
      <p className="text-sm text-muted-foreground">{t.progresso(feitos, itens.length)}</p>
      {seguinte ? (
        <Button asChild className="h-11 justify-self-start">
          <a
            href={seguinte.ligacao}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              void registar(seguinte);
              setFeitos(feitos + 1);
            }}
          >
            <MessageCircle className="size-4" aria-hidden />
            {t.abrir(seguinte.nome)}
          </a>
        </Button>
      ) : (
        <p className="text-sm font-semibold">{t.fim}</p>
      )}
      <p className="text-xs text-muted-foreground">{t.nota}</p>
    </section>
  );
}
