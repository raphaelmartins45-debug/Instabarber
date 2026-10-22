"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { avaliacaoAberta } from "@/app/(app)/app/(painel)/agenda/acoes-fila";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

/** «Pedir avaliação» depois do serviço (F.4.13): abre o WhatsApp e regista o pedido. */
export function BotaoAvaliacao({ id, ligacao }: { id: string; ligacao: string }) {
  const [aberto, setAberto] = useState(false);
  if (aberto) return null;
  return (
    <Button asChild variant="outline" size="sm" className="h-10 justify-self-start">
      <a
        href={ligacao}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          void avaliacaoAberta(id);
          setAberto(true);
        }}
      >
        <Star className="size-4" aria-hidden />
        {textos.mensagensLote.avaliar}
      </a>
    </Button>
  );
}
