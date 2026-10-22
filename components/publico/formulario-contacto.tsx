"use client";

import { useState, type ReactNode } from "react";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import type { TextosPublicos } from "@/lib/i18n/publico";

export type Contacto = { nome: string; telefone: string; consentimento: boolean };

/**
 * Nome, telemóvel e consentimento (desmarcado por omissão): fila de espera, fila presencial e
 * encomenda da loja. Os campos extra entram como filhos, entre o telemóvel e o consentimento.
 */
export function FormularioContacto({
  t,
  prefixo,
  inicial,
  submeter,
  erro,
  aEnviar,
  aoEnviar,
  children,
}: {
  t: TextosPublicos;
  prefixo: string;
  inicial?: Partial<Contacto>;
  submeter: string;
  erro?: string;
  aEnviar: boolean;
  aoEnviar: (c: Contacto) => void;
  children?: ReactNode;
}) {
  const m = t.marcacao;
  const [v, setV] = useState<Contacto>({
    nome: inicial?.nome ?? "",
    telefone: inicial?.telefone ?? "",
    consentimento: false,
  });
  return (
    <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), aoEnviar(v))}>
      <Campo
        id={`${prefixo}-nome`}
        rotulo={m.nome}
        autoComplete="name"
        value={v.nome}
        onChange={(e) => setV({ ...v, nome: e.target.value })}
      />
      <Campo
        id={`${prefixo}-telefone`}
        rotulo={m.telefone}
        ajuda={m.telefoneAjuda}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        maxLength={11}
        value={v.telefone}
        onChange={(e) => setV({ ...v, telefone: e.target.value })}
      />
      {children}
      <label className="flex min-h-11 items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={v.consentimento}
          onChange={(e) => setV({ ...v, consentimento: e.target.checked })}
        />
        {m.consentimento}
      </label>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <Button type="submit" className="h-12 w-full text-base" disabled={aEnviar}>
        {submeter}
      </Button>
    </form>
  );
}
