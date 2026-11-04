"use client";

import { useState, useTransition } from "react";
import {
  bloquearHoras,
  desbloquear,
} from "@/app/(app)/app/(painel)/equipa/[id]/disponibilidade/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { dataCurta, horaCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { MarcacaoNoPeriodo } from "@/lib/repositorios/painel/calendario";

const t = textos.profissional.disponibilidade;

export type LinhaBloqueio = {
  id: string;
  inicio: string;
  fim: string;
  tipo: string;
  motivo: string | null;
  /** O barbeiro só desbloqueia o que ele próprio bloqueou (o gestor desbloqueia tudo). */
  podeRemover: boolean;
};

/** As horas bloqueadas do barbeiro (D-202): bloquear um período de um dia e a lista dos próximos. */
export function BloqueiosBarbeiro({
  profissionalId,
  bloqueios,
  hoje,
  horario,
}: {
  profissionalId: string;
  bloqueios: LinhaBloqueio[];
  hoje: string;
  /** Abertura e fecho da barbearia (HH:MM), para «O dia todo». */
  horario: { abertura: string; fecho: string };
}) {
  const [v, setV] = useState({ dia: hoje, de: "", ate: "", motivo: "" });
  const [erro, setErro] = useState<string>();
  const [conflitos, setConflitos] = useState<MarcacaoNoPeriodo[]>([]);
  const [feito, setFeito] = useState(false);
  const [aGuardar, iniciar] = useTransition();
  const muda = (campo: keyof typeof v, valor: string) => setV((x) => ({ ...x, [campo]: valor }));
  const erroDe = (codigo: string) => textos.sistema.erros[codigo] ?? textos.comum.erroGuardar;

  const bloquear = () =>
    iniciar(async () => {
      setErro(undefined);
      setConflitos([]);
      setFeito(false);
      const r = await bloquearHoras(profissionalId, v);
      if (r.ok) {
        setFeito(true);
        setV({ dia: v.dia, de: "", ate: "", motivo: "" });
        return;
      }
      setErro(erroDe(r.erro));
      if ("conflitos" in r) setConflitos(r.conflitos);
    });

  return (
    <div className="grid gap-5">
      <form
        className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-end"
        onSubmit={(e) => (e.preventDefault(), bloquear())}
      >
        <Campo
          id="bloqueio-dia"
          rotulo={t.dia}
          type="date"
          min={hoje}
          value={v.dia}
          onChange={(e) => muda("dia", e.target.value)}
        />
        <Campo
          id="bloqueio-de"
          rotulo={t.de}
          type="time"
          value={v.de}
          onChange={(e) => muda("de", e.target.value)}
        />
        <Campo
          id="bloqueio-ate"
          rotulo={t.ate}
          type="time"
          value={v.ate}
          onChange={(e) => muda("ate", e.target.value)}
        />
        <div className="sm:col-span-3">
          <Campo
            id="bloqueio-motivo"
            rotulo={t.motivo}
            maxLength={200}
            value={v.motivo}
            onChange={(e) => muda("motivo", e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-3">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => setV((x) => ({ ...x, de: horario.abertura, ate: horario.fecho }))}
          >
            {t.diaTodo}
          </Button>
          <Button type="submit" className="h-11" disabled={aGuardar || !v.de || !v.ate}>
            {t.bloquear}
          </Button>
        </div>
      </form>
      {feito ? <Aviso tipo="sucesso">{t.bloqueado}</Aviso> : null}
      {erro ? (
        <Aviso tipo="erro">
          <span className="grid gap-2">
            <span>{conflitos.length ? t.conflitos : erro}</span>
            {conflitos.length ? (
              <ul className="grid gap-1">
                {conflitos.map((c) => (
                  <li key={c.inicio} className="font-semibold">
                    {horaCurta(c.inicio)} · {c.cliente ?? "—"} · {c.servico ?? ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </span>
        </Aviso>
      ) : null}
      {bloqueios.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {bloqueios.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span className="grid gap-0.5">
                <span className="font-semibold tabular-nums">
                  {dataCurta(b.inicio)} · {horaCurta(b.inicio)}–{horaCurta(b.fim)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {textos.agenda.tiposAusencia[b.tipo]}
                  {b.motivo ? ` · ${b.motivo}` : ""}
                  {b.podeRemover ? "" : ` · ${t.doGestor}`}
                </span>
              </span>
              {b.podeRemover ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10"
                  disabled={aGuardar}
                  onClick={() =>
                    iniciar(async () => {
                      const r = await desbloquear(profissionalId, b.id);
                      if (!r.ok) setErro(erroDe(r.erro));
                    })
                  }
                >
                  {t.remover}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
