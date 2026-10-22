"use client";

import { useState, useTransition } from "react";
import { guardarPlano } from "@/app/(app)/app/(painel)/sistema/acoes-clube";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Plano } from "@/lib/repositorios/painel/clube";
import type { Servico } from "@/lib/repositorios/painel/servicos";

const t = textos.sistema.clube;

/** Um plano do clube: nome, preço mensal, validade, transitar crédito, renovação e serviços incluídos. */
export function FormularioPlano({ plano, servicos }: { plano: Plano | null; servicos: Servico[] }) {
  const inicial = () => ({
    nome: plano?.nome ?? "",
    precoCent: plano ? textoDeCentimos(plano.precoCent) : "",
    validadeDias: String(plano?.validadeDias ?? 30),
    transitaCredito: plano?.transitaCredito ?? false,
    renovacaoAuto: plano?.renovacaoAuto ?? true,
    ativo: plano?.ativo ?? true,
    servicos: Object.fromEntries(
      servicos.map((s) => [
        s.id,
        String(plano?.servicos.find((x) => x.servicoId === s.id)?.quantidade ?? ""),
      ]),
    ),
  });
  const [v, setV] = useState(inicial);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const id = plano?.id ?? "novo";
  const caixa = (nome: "transitaCredito" | "renovacaoAuto" | "ativo", rotulo: string) => (
    <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
      <input
        type="checkbox"
        checked={v[nome]}
        onChange={(e) => setV({ ...v, [nome]: e.target.checked })}
      />
      {rotulo}
    </label>
  );
  const enviar = () =>
    iniciar(async () => {
      const r = await guardarPlano(plano?.id ?? null, v);
      if (r.ok && !plano) setV(inicial());
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: textos.comum.guardado }
          : { tipo: "erro", texto: textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar },
      );
    });
  return (
    <form
      className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
      onSubmit={(e) => (e.preventDefault(), enviar())}
      data-testid="plano-clube"
    >
      <Campo
        id={`plano-${id}-nome`}
        rotulo={t.nome}
        value={v.nome}
        onChange={(e) => setV({ ...v, nome: e.target.value })}
      />
      <Campo
        id={`plano-${id}-preco`}
        rotulo={t.preco}
        inputMode="decimal"
        value={v.precoCent}
        onChange={(e) => setV({ ...v, precoCent: e.target.value })}
      />
      <Campo
        id={`plano-${id}-validade`}
        rotulo={t.validade}
        inputMode="numeric"
        value={v.validadeDias}
        onChange={(e) => setV({ ...v, validadeDias: e.target.value })}
      />
      <fieldset className="grid gap-2 sm:col-span-2">
        <legend className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {t.servicos}
        </legend>
        {servicos.map((s) => (
          <label key={s.id} className="flex items-center gap-3 text-sm">
            <input
              inputMode="numeric"
              aria-label={s.nome}
              className="h-11 w-20 rounded-md border bg-card px-3"
              value={v.servicos[s.id] ?? ""}
              onChange={(e) => setV({ ...v, servicos: { ...v.servicos, [s.id]: e.target.value } })}
            />
            {s.nome}
          </label>
        ))}
      </fieldset>
      {caixa("transitaCredito", t.transita)}
      {caixa("renovacaoAuto", t.renovacao)}
      {caixa("ativo", t.ativo)}
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
        {t.guardar}
      </Button>
    </form>
  );
}
