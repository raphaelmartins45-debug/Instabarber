"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

type Resultado = { ok: true; n?: number } | { ok: false; erro: string };

/**
 * Botão que corre uma ação de servidor das Finanças e atualiza o ecrã. Com `confirmar`, pede
 * confirmação antes (as que apagam). `sucesso` dá o texto a mostrar quando corre bem.
 */
export function BotaoAcao({
  rotulo,
  acao,
  confirmar,
  sucesso,
  variante = "outline",
}: {
  rotulo: string;
  acao: () => Promise<Resultado>;
  confirmar?: { titulo: string; texto: string };
  sucesso?: (n: number) => string;
  variante?: "outline" | "ghost" | "default";
}) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aCorrer, iniciar] = useTransition();
  const correr = () =>
    iniciar(async () => {
      const r = await acao();
      if (!r.ok) return setAviso({ tipo: "erro", texto: textos.financas.erros.generico! });
      setAviso(sucesso ? { tipo: "sucesso", texto: sucesso(r.n ?? 0) } : undefined);
      router.refresh();
    });
  const botao = (
    <Button
      type="button"
      size="sm"
      variant={variante}
      disabled={aCorrer}
      onClick={confirmar ? undefined : correr}
    >
      {rotulo}
    </Button>
  );
  return (
    <div className="grid gap-2">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      {confirmar ? (
        <ConfirmarAcao
          titulo={confirmar.titulo}
          descricao={confirmar.texto}
          confirmar={rotulo}
          aoConfirmar={correr}
        >
          {botao}
        </ConfirmarAcao>
      ) : (
        botao
      )}
    </div>
  );
}
