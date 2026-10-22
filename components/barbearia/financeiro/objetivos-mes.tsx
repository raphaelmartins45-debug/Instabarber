"use client";

import { useState, useTransition } from "react";
import { guardarObjetivo } from "@/app/(app)/app/(painel)/financeiro/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { BarraProgresso } from "@/components/nucleo/barra-progresso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { ObjetivoProfissional } from "@/lib/painel/financeiro";
import type { ProgressoObjetivo } from "@/lib/regras/objetivos";

const t = textos.financeiro.objetivo;

/** Objetivo do mês da barbearia e, no Pro, por profissional (F.3). */
export function ObjetivosMes({
  mes,
  progresso,
  profissionais,
  porProfissional,
  editavel,
}: {
  /** AAAA-MM-01 */
  mes: string;
  progresso: ProgressoObjetivo;
  profissionais: ObjetivoProfissional[];
  porProfissional: boolean;
  editavel: boolean;
}) {
  const [valores, setValores] = useState<Record<string, string>>(() =>
    Object.fromEntries([
      ["", progresso.objetivoCent ? textoDeCentimos(progresso.objetivoCent) : ""],
      ...profissionais.map((p) => [
        p.profissionalId,
        p.objetivoCent ? textoDeCentimos(p.objetivoCent) : "",
      ]),
    ]),
  );
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const guardar = (profissionalId: string) =>
    iniciar(async () => {
      const r = await guardarObjetivo({
        profissionalId,
        mes,
        valor: valores[profissionalId] ?? "",
      });
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
          : { tipo: "erro", texto: textos.financeiro.erros.valor! },
      );
    });
  const linha = (id: string, rotulo: string) => (
    <form className="flex items-end gap-2" onSubmit={(e) => (e.preventDefault(), guardar(id))}>
      <div className="flex-1">
        <Campo
          id={`objetivo-${id || "barbearia"}`}
          rotulo={rotulo}
          inputMode="decimal"
          value={valores[id] ?? ""}
          disabled={!editavel}
          onChange={(e) => setValores({ ...valores, [id]: e.target.value })}
        />
      </div>
      {editavel ? (
        <Button type="submit" variant="outline" className="h-11" disabled={aGuardar}>
          {t.guardar}
        </Button>
      ) : null}
    </form>
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-xl border bg-card p-4">
        {linha("", t.definir)}
        {progresso.objetivoCent ? (
          <>
            <BarraProgresso percentagem={progresso.percentagem} rotulo={t.titulo} />
            <p className="text-sm">
              {t.faturado}: <strong>{formatarDinheiro(progresso.faturadoCent)}</strong> · {t.falta}:{" "}
              <strong>{formatarDinheiro(progresso.emFaltaCent)}</strong> ·{" "}
              {t.diasRestantes(progresso.diasRestantes)}
            </p>
          </>
        ) : null}
      </div>
      {porProfissional && profissionais.length ? (
        <div className="grid gap-3 rounded-xl border bg-card p-4">
          <h3 className="text-[15px] font-bold">{t.porProfissional}</h3>
          {profissionais.map((p) => (
            <div key={p.profissionalId} className="grid gap-2">
              {linha(p.profissionalId, p.nome)}
              {p.objetivoCent ? (
                <BarraProgresso percentagem={p.percentagem} rotulo={p.nome} />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
    </div>
  );
}
