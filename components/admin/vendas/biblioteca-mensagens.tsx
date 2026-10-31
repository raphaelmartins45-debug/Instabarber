"use client";

import { useState } from "react";
import { Campo } from "@/components/nucleo/campo";
import { textos } from "@/lib/i18n/pt-PT";
import { AcoesTexto } from "./acoes-texto";

const t = textos.vendas.mensagens;
const base = textos.comercial.mensagens.textos;

const MODELOS: Record<string, (nome: string) => string> = {
  primeiro: base.primeiro,
  seguimento: base.seguimento,
  fimContrato: base.fimContrato,
  posDemonstracao: t.textos.posDemonstracao,
  envioProposta: t.textos.envioProposta,
  aposAssinatura: t.textos.aposAssinatura,
};

/**
 * Mensagens prontas para qualquer conversa (D-181), arrumadas pelo momento da venda. Os textos
 * de contacto são os mesmos da ficha do lead (D-162); lá ficam no histórico, aqui só se copiam
 * ou abrem no WhatsApp.
 */
export function BibliotecaMensagens() {
  const [nome, setNome] = useState("");
  const quem = nome.trim() || t.nomeVazio;
  return (
    <div className="grid gap-5" data-testid="biblioteca-mensagens">
      <div className="sm:max-w-xs">
        <Campo
          id="mensagens-nome"
          rotulo={t.nome}
          value={nome}
          autoComplete="off"
          maxLength={80}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>
      {t.grupos.map((g) => (
        <section key={g.titulo} className="grid gap-2" aria-label={g.titulo}>
          <h3 className="rotulo">{g.titulo}</h3>
          <ul className="grid gap-3 lg:grid-cols-2">
            {g.modelos.map((m) => {
              const texto = MODELOS[m]!(quem);
              return (
                <li
                  key={m}
                  className="grid content-between gap-3 rounded-xl border p-3"
                  data-testid={`mensagem-${m}`}
                >
                  <div className="grid gap-1">
                    <p className="font-semibold">{t.modelos[m]}</p>
                    <p className="text-sm [overflow-wrap:anywhere] text-muted-foreground">
                      {texto}
                    </p>
                  </div>
                  <AcoesTexto texto={texto} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
