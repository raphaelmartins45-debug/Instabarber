"use client";

import { useState, useTransition } from "react";
import {
  apagarPeriodo,
  mudarPeriodo,
  novoPeriodo,
} from "@/app/(app)/app/(painel)/sistema/acoes-configuracao";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Selecao } from "@/components/nucleo/selecao";
import { Button } from "@/components/ui/button";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import type { Periodo } from "@/lib/repositorios/painel/calendario";

const t = textos.sistema.periodos;
const dias = textos.sistema.diasSemana;

export function PeriodosDesconto({ periodos }: { periodos: Periodo[] }) {
  const [v, setV] = useState({
    diaSemana: "2",
    horaInicio: "14:00",
    horaFim: "17:00",
    percentagem: "20",
  });
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: true } | { ok: false; erro: string }>) =>
    iniciar(async () => {
      const r = await acao();
      setErro(r.ok ? undefined : (textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar));
    });
  return (
    <div className="grid gap-4">
      {periodos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="grid gap-2">
          {periodos.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <span>
                <span className="font-semibold">{dias[p.diaSemana]}</span> ·{" "}
                {p.horaInicio.slice(0, 5)}–{p.horaFim.slice(0, 5)} · −
                {formatarNumero(p.percentagem)} %
              </span>
              <span className="flex items-center gap-2">
                <label className="flex min-h-10 items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={p.ativo}
                    onChange={(e) => {
                      const ativo = e.target.checked;
                      correr(() => mudarPeriodo(p.id, ativo));
                    }}
                  />
                  {t.ativo}
                </label>
                <ConfirmarAcao
                  titulo={t.remover}
                  descricao={t.ajuda}
                  confirmar={t.remover}
                  aoConfirmar={() => correr(() => apagarPeriodo(p.id))}
                >
                  <Button variant="ghost" size="sm" className="h-10">
                    {t.remover}
                  </Button>
                </ConfirmarAcao>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form
        className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
        onSubmit={(e) => (e.preventDefault(), correr(() => novoPeriodo(v)))}
      >
        <h3 className="text-[15px] font-bold sm:col-span-2">{t.novo}</h3>
        <Selecao
          id="periodo-dia"
          rotulo={t.dia}
          valor={v.diaSemana}
          aoMudar={(x) => setV({ ...v, diaSemana: x })}
          opcoes={dias.map((d, i) => ({ id: String(i), rotulo: d }))}
        />
        <Campo
          id="periodo-percentagem"
          rotulo={t.percentagem}
          inputMode="decimal"
          value={v.percentagem}
          onChange={(e) => setV({ ...v, percentagem: e.target.value })}
        />
        <Campo
          id="periodo-inicio"
          rotulo={t.inicio}
          type="time"
          value={v.horaInicio}
          onChange={(e) => setV({ ...v, horaInicio: e.target.value })}
        />
        <Campo
          id="periodo-fim"
          rotulo={t.fim}
          type="time"
          value={v.horaFim}
          onChange={(e) => setV({ ...v, horaFim: e.target.value })}
        />
        {erro ? (
          <div className="sm:col-span-2">
            <Aviso tipo="erro">{erro}</Aviso>
          </div>
        ) : null}
        <Button
          type="submit"
          className="h-11 sm:col-span-2 sm:justify-self-start"
          disabled={aGuardar}
        >
          {t.acrescentar}
        </Button>
      </form>
    </div>
  );
}
