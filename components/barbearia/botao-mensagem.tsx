"use client";

import { MessageCircle } from "lucide-react";
import { mensagemAberta } from "@/app/(app)/app/(painel)/clientes/acoes";
import { Button } from "@/components/ui/button";

/**
 * Abre o WhatsApp do cliente com a mensagem pronta (wa.me) e regista a ligação aberta.
 * O envio confirma-se no WhatsApp; nada é dado como enviado (regra 7).
 */
export function BotaoMensagem({
  ligacao,
  clienteId,
  tipo,
  conteudo,
  rotulo,
}: {
  ligacao: string;
  clienteId: string;
  tipo: "recuperacao" | "posvenda" | "aniversario";
  conteudo: string;
  rotulo: string;
}) {
  return (
    <Button asChild variant="outline" size="sm" className="h-10">
      <a
        href={ligacao}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => void mensagemAberta(clienteId, tipo, conteudo)}
      >
        <MessageCircle className="size-4" aria-hidden />
        {rotulo}
      </a>
    </Button>
  );
}
