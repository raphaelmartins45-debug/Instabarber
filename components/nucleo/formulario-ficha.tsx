"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import type { CampoFicha } from "@/lib/admin/ficha";
import { textos } from "@/lib/i18n/pt-PT";
import {
  ESQUEMAS_FORMULARIO,
  type EsquemaFormulario,
  type ResultadoFicha,
} from "@/lib/validacao/formularios";
import { CampoFicha as Campo } from "./campo-ficha";

const erros: Record<string, string> = textos.admin.ficha.erros;

/**
 * Um bloco de campos da barbearia que grava de forma independente, com confirmação visual: os
 * separadores da ficha no Admin (E.1) e as secções da Gestão do sistema (E.2). A ação de gravar
 * vem do servidor e valida com o mesmo esquema Zod.
 */
export function FormularioFicha({
  esquema,
  campos,
  valores,
  guardar,
}: {
  esquema: EsquemaFormulario;
  campos: CampoFicha[];
  valores: Record<string, unknown>;
  guardar: (esquema: EsquemaFormulario, dados: Record<string, unknown>) => Promise<ResultadoFicha>;
}) {
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(ESQUEMAS_FORMULARIO[esquema] as never),
    defaultValues: valores,
  });

  const enviar = form.handleSubmit(() =>
    iniciar(async () => {
      // Os valores tal como escritos: o servidor valida-os com o mesmo esquema.
      const r = await guardar(esquema, form.getValues());
      if (r.ok) return setAviso({ tipo: "sucesso", texto: textos.comum.guardado });
      if (r.campo) form.setError(r.campo, { message: r.erro });
      setAviso({ tipo: "erro", texto: erros[r.erro] ?? textos.comum.erroGuardar });
    }),
  );

  return (
    <form onSubmit={enviar} className="grid max-w-2xl gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {campos.map((c) => (
          <Campo
            key={c.nome}
            campo={c}
            form={form}
            erro={erros[String(form.formState.errors[c.nome]?.message ?? "")]}
          />
        ))}
      </div>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <Button type="submit" size="lg" className="h-11 sm:justify-self-start" disabled={aGuardar}>
        {textos.comum.guardar}
      </Button>
    </form>
  );
}
