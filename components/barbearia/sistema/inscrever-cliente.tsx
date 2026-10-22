"use client";

import { useState, useTransition } from "react";
import { inscreverCliente } from "@/app/(app)/app/(painel)/sistema/acoes-clube";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Selecao } from "@/components/nucleo/selecao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.sistema.clube;

/** Inscrever um cliente (já registado) num plano: o primeiro ciclo fica por pagar até «Pago». */
export function InscreverCliente({
  planos,
  hoje,
}: {
  planos: { id: string; rotulo: string }[];
  hoje: string;
}) {
  const [v, setV] = useState({ telefone: "", plano: planos[0]?.id ?? "", inicio: hoje });
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  return (
    <form
      className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const r = await inscreverCliente(v.telefone, v.plano, v.inicio);
          setAviso(
            r.ok
              ? { tipo: "sucesso", texto: t.inscrito }
              : { tipo: "erro", texto: textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar },
          );
        });
      }}
    >
      <h3 className="text-[15px] font-bold sm:col-span-3">{t.inscrever}</h3>
      <Campo
        id="clube-telefone"
        rotulo={t.telefone}
        type="tel"
        value={v.telefone}
        onChange={(e) => setV({ ...v, telefone: e.target.value })}
      />
      <Selecao
        id="clube-plano"
        rotulo={t.plano}
        valor={v.plano}
        aoMudar={(x) => setV({ ...v, plano: x })}
        opcoes={planos}
      />
      <Campo
        id="clube-inicio"
        rotulo={t.inicio}
        type="date"
        value={v.inicio}
        onChange={(e) => setV({ ...v, inicio: e.target.value })}
      />
      {aviso ? (
        <div className="sm:col-span-3">
          <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
        </div>
      ) : null}
      <Button
        type="submit"
        className="h-11 sm:col-span-3 sm:justify-self-start"
        disabled={aGuardar}
      >
        {t.inscrever}
      </Button>
    </form>
  );
}
