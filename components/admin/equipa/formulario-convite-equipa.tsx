"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { convidar } from "@/app/(admin)/admin/(protegido)/equipa/acoes";
import { CampoEscolha } from "@/components/admin/financas/campo-escolha";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import {
  type DadosConviteEquipa,
  esquemaConviteEquipa,
  PAPEIS_CONVIDAVEIS,
} from "@/lib/validacao/equipa-plataforma";

const t = textos.gestao.equipa;

/** Convite de uma pessoa para a equipa InstaBarber (D-161): nome, e-mail e papel. */
export function FormularioConviteEquipa() {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aEnviar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues, reset } = useForm<DadosConviteEquipa>({
    resolver: zodResolver(esquemaConviteEquipa),
    defaultValues: { nome: "", email: "", papel: "comercial" },
  });
  const erro = (c: "nome" | "email") => {
    const m = formState.errors[c]?.message;
    return m ? (t.erros[m] ?? t.erros.generico) : undefined;
  };
  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await convidar(getValues());
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.convidado }
          : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
      );
      if (r.ok) {
        reset();
        router.refresh();
      }
    }),
  );
  return (
    <form onSubmit={enviar} className="cartao grid gap-4 rounded-2xl p-4" noValidate>
      <h2 className="text-[15px] font-bold">{t.novo}</h2>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id="equipa-nome" rotulo={t.campos.nome} erro={erro("nome")} {...register("nome")} />
        <Campo
          id="equipa-email"
          type="email"
          rotulo={t.campos.email}
          erro={erro("email")}
          {...register("email")}
        />
        <CampoEscolha
          id="equipa-papel"
          rotulo={t.campos.papel}
          opcoes={Object.fromEntries(PAPEIS_CONVIDAVEIS.map((p) => [p, t.papeis[p]!]))}
          {...register("papel")}
        />
      </div>
      <Button type="submit" disabled={aEnviar} className="justify-self-start">
        {t.convidar}
      </Button>
    </form>
  );
}
