"use client";

import { useState, useTransition } from "react";
import {
  registarFatura,
  registarPagamento,
} from "@/app/(admin)/admin/(protegido)/pagamentos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.pagamentos;
const erros: Record<string, string> = t.erros;
const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";

type Opcao = { id: string; rotulo: string };

/** Registar uma fatura da Performa LAB ou um recebimento (E.1). Sem cobrança automática. */
export function FormularioPagamento({
  tipo,
  barbearias,
  faturas,
  hoje,
}: {
  tipo: "fatura" | "recebimento";
  barbearias: Opcao[];
  faturas: (Opcao & { inquilinoId: string })[];
  hoje: string;
}) {
  const [v, setV] = useState<Record<string, string>>({
    inquilino_id: barbearias[0]?.id ?? "",
    numero: "",
    valor: "",
    periodo_inicio: hoje,
    periodo_fim: hoje,
    emitida_em: hoje,
    data: hoje,
    metodo: "mbway",
    fatura_id: "",
    nota: "",
  });
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const campo = (nome: string, rotulo: string, tipoInput = "text") => (
    <Campo
      id={`${tipo}-${nome}`}
      rotulo={rotulo}
      type={tipoInput}
      value={v[nome]}
      onChange={(e) => setV({ ...v, [nome]: e.target.value })}
    />
  );
  const selecao = (nome: string, rotulo: string, opcoes: Opcao[]) => (
    <label className="grid gap-1.5 text-sm">
      <span className={etiqueta}>{rotulo}</span>
      <select
        id={`${tipo}-${nome}`}
        className="h-11 rounded-md border bg-card px-3"
        value={v[nome]}
        onChange={(e) => setV({ ...v, [nome]: e.target.value })}
      >
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );

  const enviar = () =>
    iniciar(async () => {
      const r =
        tipo === "fatura"
          ? await registarFatura({
              inquilino_id: v.inquilino_id!,
              numero: v.numero!,
              valor: v.valor!,
              periodo_inicio: v.periodo_inicio!,
              periodo_fim: v.periodo_fim!,
              emitida_em: v.emitida_em!,
            })
          : await registarPagamento({
              inquilino_id: v.inquilino_id!,
              fatura_id: v.fatura_id!,
              valor: v.valor!,
              metodo: v.metodo as "mbway",
              data: v.data!,
              nota: v.nota!,
            });
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.registado }
          : { tipo: "erro", texto: erros[r.erro] ?? textos.comum.erroGuardar },
      );
    });

  return (
    <form
      className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2"
      onSubmit={(e) => (e.preventDefault(), enviar())}
    >
      <h3 className="text-[15px] font-bold sm:col-span-2">
        {tipo === "fatura" ? t.novaFatura : t.novoRecebimento}
      </h3>
      {barbearias.length > 1 ? selecao("inquilino_id", t.campos.barbearia, barbearias) : null}
      {tipo === "fatura" ? (
        <>
          {campo("numero", t.campos.numero)}
          {campo("valor", t.campos.valor)}
          {campo("emitida_em", t.campos.emitida, "date")}
          {campo("periodo_inicio", t.campos.inicio, "date")}
          {campo("periodo_fim", t.campos.fim, "date")}
        </>
      ) : (
        <>
          {campo("valor", t.campos.valor)}
          {campo("data", t.campos.data, "date")}
          {selecao(
            "metodo",
            t.campos.metodo,
            Object.entries(t.metodos).map(([id, rotulo]) => ({ id, rotulo })),
          )}
          {selecao("fatura_id", t.campos.fatura, [
            { id: "", rotulo: t.semFatura },
            ...faturas.filter((f) => f.inquilinoId === v.inquilino_id),
          ])}
          {campo("nota", t.campos.nota)}
        </>
      )}
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
        {tipo === "fatura" ? t.novaFatura : t.novoRecebimento}
      </Button>
    </form>
  );
}
