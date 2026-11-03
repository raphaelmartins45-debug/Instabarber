"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guardarCortesia } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes-condicoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosCortesia, esquemaCortesia } from "@/lib/validacao/condicoes-barbearia";

const t = textos.admin.condicoesBarbearia;

/** Ligar ou desligar a cortesia de uma barbearia, com data de fim opcional (D-189). */
export function CortesiaBarbearia(p: { inquilinoId: string; ativa: boolean; ate: string | null }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, watch, getValues } = useForm<DadosCortesia>({
    resolver: zodResolver(esquemaCortesia, undefined, { raw: true }),
    defaultValues: { ativa: p.ativa, ate: p.ate ?? "" },
  });
  const ativa = watch("ativa");
  const enviar = handleSubmit(
    () =>
      iniciar(async () => {
        const dados = getValues();
        const r = await guardarCortesia(p.inquilinoId, {
          ...dados,
          ate: dados.ativa ? dados.ate : "",
        });
        setAviso(
          r.ok
            ? { tipo: "sucesso", texto: t.guardado }
            : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
        );
        if (r.ok) router.refresh();
      }),
    () => setAviso({ tipo: "erro", texto: t.erros.data! }),
  );
  return (
    <form
      onSubmit={enviar}
      className="cartao grid gap-3 rounded-2xl p-4"
      noValidate
      data-testid="cortesia"
    >
      <h3 className="text-sm font-bold">{t.cortesia}</h3>
      <p className="text-xs text-muted-foreground">{t.cortesiaAjuda}</p>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" className="size-4 accent-destaque" {...register("ativa")} />
        {t.cortesiaAtiva}
      </label>
      {ativa ? <Campo id="cortesia-ate" type="date" rotulo={t.ate} {...register("ate")} /> : null}
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.guardarCortesia}
      </Button>
    </form>
  );
}
