"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { entrarCliente } from "@/app/(publico)/b/[slug]/entrar/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { esquemaEntradaCliente, type DadosEntradaCliente } from "@/lib/validacao/acesso";

const t = textos.acesso.cliente;
const ERROS: Record<string, string> = {
  credenciais: t.erroCredenciais,
  limite: textos.acesso.erros.limite,
};

/** Telemóvel e palavra-passe (E.4). O cliente nunca vê o e-mail técnico da conta. */
export function FormularioEntradaCliente({ slug }: { slug: string }) {
  const [erro, setErro] = useState<string>();
  const [aEnviar, iniciar] = useTransition();
  const { register, handleSubmit, formState } = useForm<DadosEntradaCliente>({
    resolver: zodResolver(esquemaEntradaCliente),
    defaultValues: { telefone: "", palavra_passe: "" },
  });

  const enviar = handleSubmit((dados) =>
    iniciar(async () => {
      const r = await entrarCliente({ ...dados, slug });
      if ("destino" in r) return window.location.assign(r.destino);
      setErro(ERROS[r.erro] ?? textos.acesso.erros.generico);
    }),
  );

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <Campo
        id="telefone"
        rotulo={t.telemovel}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={t.exemploTelemovel}
        erro={formState.errors.telefone ? t.erroTelemovel : undefined}
        {...register("telefone")}
      />
      <Campo
        id="palavra_passe"
        rotulo={t.palavraPasse}
        type="password"
        autoComplete="current-password"
        {...register("palavra_passe")}
      />
      <Button type="submit" size="lg" className="h-11" disabled={aEnviar}>
        {t.botao}
      </Button>
    </form>
  );
}
