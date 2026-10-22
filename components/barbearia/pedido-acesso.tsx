"use client";

import { useEffect, useState, useTransition } from "react";
import { confirmarEnvioCodigo } from "@/app/(app)/app/(painel)/acoes";
import { Button } from "@/components/ui/button";
import { minutosAte } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.paineis.pedidosAcesso;

/**
 * Um pedido de acesso: o botão abre o WhatsApp com o código escrito; o envio só conta
 * depois de «Já enviei» (regra 7). O tempo restante atualiza-se sozinho.
 */
export function PedidoAcesso({
  id,
  nome,
  telefone,
  expiraEm,
  enviadoInicial,
  ligacao,
}: {
  id: string;
  nome: string;
  telefone: string;
  expiraEm: string;
  enviadoInicial: boolean;
  ligacao: string;
}) {
  const [minutos, setMinutos] = useState(() => minutosAte(expiraEm));
  const [aberto, setAberto] = useState(false);
  const [enviado, setEnviado] = useState(enviadoInicial);
  const [aGuardar, iniciar] = useTransition();

  useEffect(() => {
    const relogio = setInterval(() => setMinutos(minutosAte(expiraEm)), 15_000);
    return () => clearInterval(relogio);
  }, [expiraEm]);

  return (
    <li
      className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3"
      data-testid="pedido-acesso"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{nome}</p>
        <p className="text-sm text-muted-foreground">
          {telefone} · {minutos > 0 ? t.expiraEm(minutos) : t.expirado}
        </p>
      </div>
      {enviado ? (
        <span className="text-sm font-semibold text-sucesso">{t.enviado}</span>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="bg-sucesso hover:bg-sucesso/90"
            onClick={() => setAberto(true)}
          >
            <a href={ligacao} target="_blank" rel="noopener noreferrer">
              {t.enviar}
            </a>
          </Button>
          {aberto ? (
            <Button
              variant="outline"
              disabled={aGuardar}
              onClick={() => iniciar(async () => setEnviado((await confirmarEnvioCodigo(id)).ok))}
            >
              {t.confirmar}
            </Button>
          ) : null}
        </div>
      )}
    </li>
  );
}
