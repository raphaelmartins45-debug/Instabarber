"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { definirPalavraPasse } from "@/app/(auth)/entrar/acoes";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { esquemaDefinirPalavraPasse, type DadosDefinirPalavraPasse } from "@/lib/validacao/acesso";
import { Aviso } from "./aviso";
import { Campo } from "./campo";

const t = textos.acesso.definir;
const ERROS: Record<string, string> = {
  palavra_passe_curta: t.erroCurta,
  palavra_passe_longa: t.erroFraca,
  diferentes: t.erroDiferentes,
  fraca: t.erroFraca,
  ligacao: t.ligacaoInvalida,
};

/** Palavra-passe escolhida pela própria pessoa, depois do convite ou da recuperação (B9). */
export function FormularioDefinir() {
  const [erro, setErro] = useState<string>();
  const [aEnviar, iniciar] = useTransition();
  const { register, handleSubmit, formState } = useForm<DadosDefinirPalavraPasse>({
    resolver: zodResolver(esquemaDefinirPalavraPasse),
    defaultValues: { palavra_passe: "", repetir: "" },
  });
  const erroCampo = (codigo?: string) => (codigo ? ERROS[codigo] : undefined);

  const enviar = handleSubmit((dados) =>
    iniciar(async () => {
      const r = await definirPalavraPasse(dados);
      if (r?.destino) return window.location.assign(r.destino);
      setErro(r?.erro ? (ERROS[r.erro] ?? textos.acesso.erros.generico) : undefined);
    }),
  );

  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <Campo
        id="palavra_passe"
        rotulo={t.nova}
        type="password"
        autoComplete="new-password"
        erro={erroCampo(formState.errors.palavra_passe?.message)}
        {...register("palavra_passe")}
      />
      <Campo
        id="repetir"
        rotulo={t.repetir}
        type="password"
        autoComplete="new-password"
        erro={erroCampo(formState.errors.repetir?.message)}
        {...register("repetir")}
      />
      <Button type="submit" size="lg" className="h-11" disabled={aEnviar}>
        {t.botao}
      </Button>
    </form>
  );
}
