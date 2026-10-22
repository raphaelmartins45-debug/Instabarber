"use client";

import { useState, useTransition } from "react";
import { guardarHorarioBarbeiro } from "@/app/(app)/app/(painel)/sistema/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.sistema.equipa;
const dias = textos.sistema.diasSemana;

export type FaixaHorario = { diaSemana: string; inicio: string; fim: string };

/** Horário próprio do barbeiro: faixas por dia (várias no mesmo dia permitem pausas). */
export function HorarioBarbeiro({ id, inicial }: { id: string; inicial: FaixaHorario[] }) {
  const [faixas, setFaixas] = useState(inicial);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const muda = (i: number, campo: keyof FaixaHorario, valor: string) =>
    setFaixas(faixas.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));
  const caixa = "h-11 rounded-md border bg-card px-2 text-sm";
  return (
    <fieldset className="grid gap-2">
      <legend className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {t.horarioProprio}
      </legend>
      <p className="text-xs text-muted-foreground">
        {faixas.length ? t.horarioAjuda : t.semHorario}
      </p>
      {faixas.map((f, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t.horarioProprio}
            className={caixa}
            value={f.diaSemana}
            onChange={(e) => muda(i, "diaSemana", e.target.value)}
          >
            {dias.map((d, n) => (
              <option key={d} value={String(n)}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            aria-label={textos.sistema.horario.abertura}
            className={caixa}
            value={f.inicio}
            onChange={(e) => muda(i, "inicio", e.target.value)}
          />
          <input
            type="time"
            aria-label={textos.sistema.horario.fecho}
            className={caixa}
            value={f.fim}
            onChange={(e) => muda(i, "fim", e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10"
            onClick={() => setFaixas(faixas.filter((_, j) => j !== i))}
          >
            {textos.sistema.ausencias.remover}
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => setFaixas([...faixas, { diaSemana: "2", inicio: "09:00", fim: "19:00" }])}
        >
          {t.acrescentarFaixa}
        </Button>
        <Button
          type="button"
          className="h-11"
          disabled={aGuardar}
          onClick={() =>
            iniciar(async () => {
              const r = await guardarHorarioBarbeiro(id, faixas);
              setAviso(
                r.ok
                  ? { tipo: "sucesso", texto: textos.comum.guardado }
                  : {
                      tipo: "erro",
                      texto: textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar,
                    },
              );
            })
          }
        >
          {textos.comum.guardar}
        </Button>
      </div>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
    </fieldset>
  );
}
