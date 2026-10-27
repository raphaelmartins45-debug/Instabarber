"use client";

import { useState } from "react";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { AcoesTexto } from "./acoes-texto";

const t = textos.vendas.mensagens;
const base = textos.comercial.mensagens.textos;

const MODELOS = {
  primeiro: base.primeiro,
  seguimento: base.seguimento,
  posDemonstracao: t.textos.posDemonstracao,
  envioProposta: t.textos.envioProposta,
  fimContrato: base.fimContrato,
  aposAssinatura: t.textos.aposAssinatura,
} as const;

type Modelo = keyof typeof MODELOS;

/**
 * Mensagens prontas para qualquer conversa (D-181). Os textos de contacto são os mesmos da
 * ficha do lead (D-162); lá ficam no histórico, aqui só se copiam ou abrem no WhatsApp.
 */
export function BibliotecaMensagens() {
  const [nome, setNome] = useState("");
  const [modelo, setModelo] = useState<Modelo>("primeiro");
  const texto = MODELOS[modelo](nome.trim() || t.nomeVazio);
  return (
    <div className="grid gap-3" data-testid="biblioteca-mensagens">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <Campo
        id="mensagens-nome"
        rotulo={t.nome}
        value={nome}
        autoComplete="off"
        onChange={(e) => setNome(e.target.value)}
      />
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.titulo}>
        {(Object.keys(MODELOS) as Modelo[]).map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={m === modelo ? "default" : "outline"}
            aria-pressed={m === modelo}
            onClick={() => setModelo(m)}
          >
            {t.modelos[m]}
          </Button>
        ))}
      </div>
      <p className="rounded-xl border bg-foreground/[.03] p-3 text-sm" data-testid="mensagem-texto">
        {texto}
      </p>
      <AcoesTexto texto={texto} />
    </div>
  );
}
