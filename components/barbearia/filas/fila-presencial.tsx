"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { estadoFilaPresencial } from "@/app/(app)/app/(painel)/agenda/acoes-fila";
import { Aviso } from "@/components/nucleo/aviso";
import { Secao } from "@/components/nucleo/secao";
import { Button } from "@/components/ui/button";
import { horaCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { EntradaPresencial } from "@/lib/repositorios/painel/filas";

const t = textos.filas;

/** A fila de hoje que entra pelo código QR (F.4.3): chamar, atendido ou saiu. */
export function FilaPresencial({
  entradas,
  qr,
}: {
  entradas: EntradaPresencial[];
  /** Página do código QR para imprimir (só o gestor). */
  qr?: string;
}) {
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const mudar = (id: string, estado: string) =>
    iniciar(async () => {
      const r = await estadoFilaPresencial(id, estado);
      setErro(r.ok ? undefined : textos.agenda.erros.erro);
    });
  const botao = (id: string, estado: string, rotulo: string, variante?: "outline" | "ghost") => (
    <Button
      size="sm"
      variant={variante}
      className="h-10"
      disabled={aGuardar}
      onClick={() => mudar(id, estado)}
    >
      {rotulo}
    </Button>
  );
  return (
    <Secao id="fila-presencial" titulo={t.presencialTitulo}>
      {entradas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.presencialVazia}</p>
      ) : (
        <ol className="grid gap-2" data-testid="fila-presencial">
          {entradas.map((e, i) => (
            <li key={e.id} className="grid gap-2 rounded-xl border bg-card p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {e.estado === "aguarda" ? `${t.posicao(i + 1)} ` : null}
                  {e.cliente}
                  <span className="font-normal text-muted-foreground">
                    {" · "}
                    {e.servico ?? t.semServico}
                    {e.semConta ? ` · ${t.naoRegistado}` : null}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {e.estado === "em_atendimento"
                    ? t.emAtendimento(e.profissional ?? "—")
                    : t.entrou(horaCurta(e.entrouEm))}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {e.estado === "aguarda"
                  ? botao(e.id, "em_atendimento", t.chamar)
                  : botao(e.id, "atendido", t.atendido)}
                {botao(e.id, "saiu", t.saiu, "ghost")}
              </div>
            </li>
          ))}
        </ol>
      )}
      {qr ? (
        <Link href={qr} className="text-sm font-semibold underline underline-offset-4">
          {t.codigoQr}
        </Link>
      ) : null}
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
    </Secao>
  );
}
