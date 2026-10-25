"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { registarApoio } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes-apoio";
import { CampoEscolha } from "@/components/admin/financas/campo-escolha";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosApoio, esquemaApoio } from "@/lib/validacao/gestao";
import { CampoTextoLongo } from "./campo-texto-longo";

const t = textos.gestao.apoio;

/** Novo registo de apoio de uma barbearia (D-160). */
export function FormularioApoio({ inquilinoId }: { inquilinoId: string }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues, reset } = useForm<DadosApoio>({
    resolver: zodResolver(esquemaApoio),
    defaultValues: { tipo: "chamada", assunto: "", texto: "" },
  });
  const erro = (c: "assunto" | "texto") => {
    const m = formState.errors[c]?.message;
    return m ? (t.erros[m] ?? t.erros.generico) : undefined;
  };
  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await registarApoio(inquilinoId, getValues());
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
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
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <CampoEscolha
          id="apoio-tipo"
          rotulo={t.campos.tipo}
          opcoes={t.tipos}
          {...register("tipo")}
        />
        <Campo
          id="apoio-assunto"
          rotulo={t.campos.assunto}
          erro={erro("assunto")}
          {...register("assunto")}
        />
      </div>
      <CampoTextoLongo
        id="apoio-texto"
        rotulo={t.campos.texto}
        erro={erro("texto")}
        {...register("texto")}
      />
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.guardar}
      </Button>
    </form>
  );
}
