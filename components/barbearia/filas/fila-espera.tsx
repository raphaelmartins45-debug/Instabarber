"use client";

import { useState, useTransition, type ReactNode } from "react";
import { avisarFila, estadoFilaEspera } from "@/app/(app)/app/(painel)/agenda/acoes-fila";
import { Aviso } from "@/components/nucleo/aviso";
import { Secao } from "@/components/nucleo/secao";
import { Button } from "@/components/ui/button";
import { horaCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { EntradaComVaga } from "@/lib/painel/filas";

const t = textos.filas;

/**
 * A fila de espera do dia ao lado das vagas (F.4.1): avisar por wa.me com um clique (Pro), prazo
 * de 30 minutos, e passar ao seguinte quando o prazo acaba. No Basic, a chamada de upgrade.
 */
export function FilaEspera({
  entradas,
  dia,
  podeAvisar,
  upgrade,
}: {
  entradas: EntradaComVaga[];
  dia: string;
  podeAvisar: boolean;
  upgrade?: ReactNode;
}) {
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: boolean }>) =>
    iniciar(async () => {
      const r = await acao();
      setErro(r.ok ? undefined : textos.agenda.erros.erro);
    });
  return (
    <Secao id="fila-espera" titulo={t.esperaTitulo}>
      <p className="text-sm text-muted-foreground">{t.esperaAjuda}</p>
      {entradas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.esperaVazia}</p>
      ) : (
        <ol className="grid gap-2" data-testid="fila-espera">
          {entradas.map((e, i) => (
            <li key={e.id} className="grid gap-2 rounded-xl border bg-card p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {t.posicao(i + 1)} {e.cliente}
                  <span className="font-normal text-muted-foreground"> · {e.servico}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {e.estado === "avisado" && e.expiraEm
                    ? t.avisado(horaCurta(e.expiraEm))
                    : e.estado === "expirado"
                      ? t.expirado
                      : e.vaga
                        ? t.vagaAberta(horaCurta(e.vaga))
                        : t.semVaga}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {e.estado === "aguarda" && e.aviso && podeAvisar ? (
                  <Button asChild size="sm" className="h-10">
                    <a
                      href={e.aviso.ligacao}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => correr(() => avisarFila(e.id, dia))}
                    >
                      {t.avisar}
                    </a>
                  </Button>
                ) : null}
                {e.estado === "avisado" ? (
                  <Button
                    size="sm"
                    className="h-10"
                    disabled={aGuardar}
                    onClick={() => correr(() => estadoFilaEspera(e.id, "aceite"))}
                  >
                    {t.marcou}
                  </Button>
                ) : null}
                {e.estado === "expirado" ? (
                  <Button
                    size="sm"
                    className="h-10"
                    disabled={aGuardar}
                    onClick={() => correr(() => estadoFilaEspera(e.id, "expirado"))}
                  >
                    {t.seguinte}
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10"
                  disabled={aGuardar}
                  onClick={() => correr(() => estadoFilaEspera(e.id, "removido"))}
                >
                  {t.remover}
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {!podeAvisar && entradas.length ? upgrade : null}
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
    </Secao>
  );
}
