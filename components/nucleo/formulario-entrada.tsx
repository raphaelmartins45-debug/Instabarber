"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { entrarEquipa } from "@/app/(auth)/entrar/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { esquemaEntradaEquipa, type DadosEntradaEquipa } from "@/lib/validacao/acesso";
import { Aviso } from "./aviso";
import { Campo } from "./campo";

const t = textos.acesso;
const ERROS: Record<string, string> = {
  credenciais: t.equipa.erroCredenciais,
  sem_acesso: t.equipa.semAcesso,
  limite: t.erros.limite,
};

/** E-mail e palavra-passe da equipa (gestor, barbeiro e super_admin). */
export function FormularioEntrada({
  seguinte,
  erroInicial,
  recuperarHref,
}: {
  seguinte?: string;
  erroInicial?: string;
  recuperarHref: string;
}) {
  const [erro, setErro] = useState(erroInicial ? ERROS[erroInicial] : undefined);
  const [aEnviar, iniciar] = useTransition();
  const { register, handleSubmit, formState } = useForm<DadosEntradaEquipa>({
    resolver: zodResolver(esquemaEntradaEquipa),
    defaultValues: { email: "", palavra_passe: "", seguinte },
  });

  const enviar = handleSubmit((dados) =>
    iniciar(async () => {
      const r = await entrarEquipa(dados);
      if (r?.destino) return window.location.assign(r.destino);
      setErro(r?.erro ? (ERROS[r.erro] ?? t.erros.generico) : undefined);
    }),
  );

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <Campo
        id="email"
        rotulo={t.equipa.email}
        type="email"
        autoComplete="email"
        erro={formState.errors.email ? t.equipa.erroCredenciais : undefined}
        {...register("email")}
      />
      <Campo
        id="palavra_passe"
        rotulo={t.equipa.palavraPasse}
        type="password"
        autoComplete="current-password"
        {...register("palavra_passe")}
      />
      <Button type="submit" size="lg" className="h-11" disabled={aEnviar}>
        {t.equipa.botao}
      </Button>
      <Link
        href={recuperarHref}
        className="text-center text-sm text-ligacao underline-offset-4 hover:underline"
      >
        {t.equipa.esqueci}
      </Link>
    </form>
  );
}
