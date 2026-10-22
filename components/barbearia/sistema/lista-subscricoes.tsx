"use client";

import { useState, useTransition } from "react";
import { cancelar, pagarCiclo, renovarCiclo } from "@/app/(app)/app/(painel)/sistema/acoes-clube";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Subscricao } from "@/lib/repositorios/painel/clube";

const t = textos.sistema.clube;
const dia = (d: string) => dataCurta(`${d}T12:00:00Z`);

/** Subscritores com o ciclo atual: «Pago» com o método, renovar e cancelar. */
export function ListaSubscricoes({ subscricoes }: { subscricoes: Subscricao[] }) {
  const [metodos, setMetodos] = useState<Record<string, string>>({});
  const [aGuardar, iniciar] = useTransition();
  if (subscricoes.length === 0) return null;
  return (
    <ul className="grid gap-2">
      {subscricoes.map((s) => (
        <li
          key={s.id}
          className="grid gap-2 rounded-lg border bg-card p-3 text-sm"
          data-testid="subscricao"
        >
          <div className="flex flex-wrap justify-between gap-2">
            <span>
              <span className="font-semibold">{s.cliente}</span> · {s.plano} · {t.estados[s.estado]}
            </span>
            {s.estado === "ativa" ? (
              <span className="text-muted-foreground">{t.renova(dia(s.proximaRenovacao))}</span>
            ) : null}
          </div>
          {s.ciclo ? (
            <div className="flex flex-wrap items-center gap-2">
              <span>
                {dia(s.ciclo.inicio)} – {dia(s.ciclo.fim)} · {formatarDinheiro(s.ciclo.valorCent)} ·{" "}
                {s.ciclo.pagoEm
                  ? `${t.pago} (${textos.sistema.metodos[s.ciclo.metodo ?? ""] ?? ""})`
                  : t.porPagar}
              </span>
              {!s.ciclo.pagoEm ? (
                <>
                  <select
                    aria-label={t.metodo}
                    className="h-10 rounded-md border bg-card px-2"
                    value={metodos[s.ciclo.id] ?? "dinheiro"}
                    onChange={(e) => setMetodos({ ...metodos, [s.ciclo!.id]: e.target.value })}
                  >
                    {Object.entries(textos.sistema.metodos).map(([id, rotulo]) => (
                      <option key={id} value={id}>
                        {rotulo}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    className="h-10"
                    disabled={aGuardar}
                    onClick={() =>
                      iniciar(
                        async () =>
                          void (await pagarCiclo(s.ciclo!.id, metodos[s.ciclo!.id] ?? "dinheiro")),
                      )
                    }
                  >
                    {t.pago}
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
          {s.estado === "ativa" ? (
            <div className="flex flex-wrap gap-2">
              {!s.renovacaoAuto ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10"
                  disabled={aGuardar}
                  onClick={() => iniciar(async () => void (await renovarCiclo(s.id)))}
                >
                  {t.renovar}
                </Button>
              ) : null}
              <ConfirmarAcao
                titulo={t.cancelarTitulo}
                descricao={t.cancelarTexto}
                confirmar={t.cancelar}
                aoConfirmar={() => iniciar(async () => void (await cancelar(s.id)))}
              >
                <Button size="sm" variant="ghost" className="h-10">
                  {t.cancelar}
                </Button>
              </ConfirmarAcao>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
