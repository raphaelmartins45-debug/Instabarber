"use client";

import { useState, useTransition } from "react";
import { guardarDadosCliente } from "@/app/(app)/app/(painel)/clientes/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.clientes.ficha;
const erros = textos.clientes.erros;

export type DadosEditaveis = {
  nome: string;
  telefone: string;
  email: string;
  data_nascimento: string;
  nif: string;
  notas: string;
  consentimento_mensagens: boolean;
  nao_contactar: boolean;
};

/** Dados do cliente: o gestor edita; o barbeiro só lê (E.2, E.3). */
export function DadosCliente({
  id,
  inicial,
  editavel,
  consentimentoDesde,
}: {
  id: string;
  inicial: DadosEditaveis;
  editavel: boolean;
  /** Data do consentimento, já formatada. */
  consentimentoDesde: string | null;
}) {
  const [v, setV] = useState(inicial);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const campo = (nome: keyof DadosEditaveis, rotulo: string, tipo = "text") => (
    <Campo
      id={`cliente-${nome}`}
      rotulo={rotulo}
      type={tipo}
      value={String(v[nome])}
      disabled={!editavel}
      onChange={(e) => setV({ ...v, [nome]: e.target.value })}
    />
  );
  const caixa = (nome: "consentimento_mensagens" | "nao_contactar", rotulo: string) => (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={v[nome]}
        disabled={!editavel}
        onChange={(e) => setV({ ...v, [nome]: e.target.checked })}
      />
      {rotulo}
    </label>
  );
  const enviar = () =>
    iniciar(async () => {
      const r = await guardarDadosCliente(id, v);
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
          : { tipo: "erro", texto: erros[r.erro] ?? textos.comum.erroGuardar },
      );
    });

  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => (e.preventDefault(), enviar())}>
      {campo("nome", t.nome)}
      {campo("telefone", t.telefone, "tel")}
      {campo("email", t.email, "email")}
      {campo("data_nascimento", t.nascimento, "date")}
      {campo("nif", t.nif)}
      {campo("notas", t.notas)}
      <div className="grid gap-1 sm:col-span-2">
        {caixa("consentimento_mensagens", t.consentimento)}
        {consentimentoDesde && v.consentimento_mensagens ? (
          <p className="text-xs text-muted-foreground">{t.consentimentoDado(consentimentoDesde)}</p>
        ) : null}
        {caixa("nao_contactar", t.naoContactar)}
      </div>
      {aviso ? (
        <div className="sm:col-span-2">
          <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
        </div>
      ) : null}
      {editavel ? (
        <Button
          type="submit"
          className="h-11 w-full sm:col-span-2 sm:w-auto sm:justify-self-start"
          disabled={aGuardar}
        >
          {t.guardar}
        </Button>
      ) : null}
    </form>
  );
}
