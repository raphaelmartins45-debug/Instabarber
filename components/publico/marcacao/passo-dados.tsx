"use client";

import { useState } from "react";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import type { TextosPublicos } from "@/lib/i18n/publico";

export type DadosCliente = {
  nome: string;
  telefone: string;
  email: string;
  nascimento: string;
  convite: string;
  consentimento: boolean;
  palavraPasse: string;
};

/**
 * Os dados (E.4, passo 5): nome, telemóvel, e-mail e nascimento opcionais, convite, consentimento
 * desmarcado por omissão e, por baixo, a palavra-passe opcional para criar o acesso (F.9).
 */
export function PassoDados({
  t,
  inicial,
  comConta,
  erro,
  aEnviar,
  aoConfirmar,
  privacidade,
}: {
  t: TextosPublicos;
  inicial: Partial<DadosCliente>;
  /** Já tem sessão de cliente: não se pede palavra-passe. */
  comConta: boolean;
  erro?: string;
  aEnviar: boolean;
  aoConfirmar: (d: DadosCliente) => void;
  privacidade: string;
}) {
  const m = t.marcacao;
  const [v, setV] = useState<DadosCliente>({
    nome: inicial.nome ?? "",
    telefone: inicial.telefone ?? "",
    email: inicial.email ?? "",
    nascimento: "",
    convite: "",
    consentimento: false,
    palavraPasse: "",
  });
  const [criar, setCriar] = useState(false);
  const muda = (campo: keyof DadosCliente) => (e: { target: { value: string } }) =>
    setV({ ...v, [campo]: e.target.value });
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => (e.preventDefault(), aoConfirmar(criar ? v : { ...v, palavraPasse: "" }))}
    >
      <Campo
        id="m-nome"
        rotulo={m.nome}
        autoComplete="name"
        value={v.nome}
        onChange={muda("nome")}
      />
      <Campo
        id="m-telefone"
        rotulo={m.telefone}
        ajuda={m.telefoneAjuda}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        maxLength={11}
        value={v.telefone}
        onChange={muda("telefone")}
      />
      <Campo
        id="m-email"
        rotulo={m.email}
        ajuda={m.emailAjuda}
        type="email"
        autoComplete="email"
        value={v.email}
        onChange={muda("email")}
      />
      <Campo
        id="m-nascimento"
        rotulo={m.nascimento}
        ajuda={m.nascimentoAjuda}
        type="date"
        value={v.nascimento}
        onChange={muda("nascimento")}
      />
      <Campo
        id="m-convite"
        rotulo={m.convite}
        autoCapitalize="characters"
        maxLength={6}
        value={v.convite}
        onChange={muda("convite")}
      />
      <label className="flex min-h-11 items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={v.consentimento}
          onChange={(e) => setV({ ...v, consentimento: e.target.checked })}
        />
        {m.consentimento}
      </label>
      {!comConta ? (
        <div className="grid gap-3 rounded-xl border bg-card p-4">
          <label className="flex min-h-11 items-start gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              className="mt-1 size-5"
              checked={criar}
              onChange={(e) => setCriar(e.target.checked)}
            />
            <span>
              {m.criarAcesso}
              <span className="block text-xs font-normal text-muted-foreground">
                {m.criarAcessoAjuda}
              </span>
            </span>
          </label>
          {criar ? (
            <Campo
              id="m-palavra"
              rotulo={m.palavraPasse}
              type="password"
              autoComplete="new-password"
              value={v.palavraPasse}
              onChange={muda("palavraPasse")}
            />
          ) : null}
        </div>
      ) : null}
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <Button type="submit" className="h-12 w-full text-base" disabled={aEnviar}>
        {m.confirmar}
      </Button>
      <a
        href={privacidade}
        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        {m.privacidade}
      </a>
    </form>
  );
}
