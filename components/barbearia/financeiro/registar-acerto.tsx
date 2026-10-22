"use client";

import { useState, useTransition } from "react";
import { registarAcertoMes } from "@/app/(app)/app/(painel)/financeiro/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Selecao } from "@/components/nucleo/selecao";
import { Button } from "@/components/ui/button";
import { textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.financeiro.acertos;

export type OpcaoAcerto = {
  profissionalId: string;
  nome: string;
  sentido: "a_pagar" | "a_receber";
  porLiquidarCent: number;
};

/** «Registar acerto»: data, método, valor e nota; o sentido e o valor vêm propostos pelo saldo. */
export function RegistarAcerto({
  mes,
  opcoes,
  hoje,
}: {
  mes: string;
  opcoes: OpcaoAcerto[];
  hoje: string;
}) {
  const proposta = (id: string) => opcoes.find((o) => o.profissionalId === id) ?? opcoes[0];
  const [v, setV] = useState(() => {
    const o = opcoes[0];
    return {
      profissionalId: o?.profissionalId ?? "",
      sentido: o?.sentido ?? "a_pagar",
      valor: o ? textoDeCentimos(o.porLiquidarCent) : "",
      data: hoje,
      metodo: "dinheiro",
      nota: "",
    };
  });
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  if (opcoes.length === 0) return null;
  const escolher = (id: string) => {
    const o = proposta(id)!;
    setV({
      ...v,
      profissionalId: id,
      sentido: o.sentido,
      valor: textoDeCentimos(o.porLiquidarCent),
    });
  };
  const enviar = () =>
    iniciar(async () => {
      const r = await registarAcertoMes({ ...v, mes, metodo: v.metodo as "dinheiro" });
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.registado }
          : { tipo: "erro", texto: textos.financeiro.erros[r.erro] ?? textos.comum.erroGuardar },
      );
    });
  return (
    <form
      className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
      onSubmit={(e) => (e.preventDefault(), enviar())}
    >
      <h3 className="text-[15px] font-bold sm:col-span-2">{t.registar}</h3>
      <Selecao
        id="acerto-profissional"
        rotulo={t.colunas.barbeiro}
        valor={v.profissionalId}
        aoMudar={escolher}
        opcoes={opcoes.map((o) => ({ id: o.profissionalId, rotulo: o.nome }))}
      />
      <Selecao
        id="acerto-sentido"
        rotulo={t.sentido}
        valor={v.sentido}
        aoMudar={(x) => setV({ ...v, sentido: x as "a_pagar" })}
        opcoes={Object.entries(t.sentidos).map(([id, rotulo]) => ({ id, rotulo }))}
      />
      <Campo
        id="acerto-valor"
        rotulo={t.valor}
        inputMode="decimal"
        value={v.valor}
        onChange={(e) => setV({ ...v, valor: e.target.value })}
      />
      <Campo
        id="acerto-data"
        rotulo={t.data}
        type="date"
        value={v.data}
        onChange={(e) => setV({ ...v, data: e.target.value })}
      />
      <Selecao
        id="acerto-metodo"
        rotulo={t.metodo}
        valor={v.metodo}
        aoMudar={(x) => setV({ ...v, metodo: x })}
        opcoes={["dinheiro", "mbway", "transferencia"].map((id) => ({
          id,
          rotulo: textos.sistema.metodos[id]!,
        }))}
      />
      <Campo
        id="acerto-nota"
        rotulo={t.notaCampo}
        value={v.nota}
        onChange={(e) => setV({ ...v, nota: e.target.value })}
      />
      {aviso ? (
        <div className="sm:col-span-2">
          <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
        </div>
      ) : null}
      <Button
        type="submit"
        className="h-11 sm:col-span-2 sm:justify-self-start"
        disabled={aGuardar}
      >
        {t.registar}
      </Button>
    </form>
  );
}
