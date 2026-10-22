"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { recuperarPalavraPasse } from "@/app/(auth)/entrar/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { esquemaRecuperar } from "@/lib/validacao/acesso";
import { Aviso } from "./aviso";
import { Campo } from "./campo";

const t = textos.acesso;

/** Pede a ligação para definir uma palavra-passe nova. A resposta não revela se a conta existe. */
export function FormularioRecuperar({ voltarHref }: { voltarHref: string }) {
  const [enviado, setEnviado] = useState(false);
  const [aEnviar, iniciar] = useTransition();
  const { register, handleSubmit, formState } = useForm<{ email: string }>({
    resolver: zodResolver(esquemaRecuperar),
    defaultValues: { email: "" },
  });

  const enviar = handleSubmit((dados) =>
    iniciar(async () => {
      const r = await recuperarPalavraPasse(dados);
      setEnviado(!!r?.enviado);
    }),
  );

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      {enviado ? <Aviso tipo="sucesso">{t.recuperar.enviado}</Aviso> : null}
      <Campo
        id="email"
        rotulo={t.equipa.email}
        type="email"
        autoComplete="email"
        erro={formState.errors.email ? t.erros.generico : undefined}
        {...register("email")}
      />
      <Button type="submit" size="lg" className="h-11" disabled={aEnviar || enviado}>
        {t.recuperar.botao}
      </Button>
      <Link
        href={voltarHref}
        className="text-center text-sm text-ligacao underline-offset-4 hover:underline"
      >
        {t.recuperar.voltar}
      </Link>
    </form>
  );
}
