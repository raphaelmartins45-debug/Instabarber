"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guardarMetaDoMes } from "@/app/(admin)/admin/(protegido)/financas/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosMeta, esquemaMeta } from "@/lib/validacao/financas";
import { CampoEscolha } from "./campo-escolha";

const t = textos.financas;

/** Objetivo de faturação de um mês (O.7): valor sem IVA e a base sobre que se mede. */
export function FormularioMeta({ mes }: { mes: string }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues } = useForm<DadosMeta>({
    resolver: zodResolver(esquemaMeta),
    defaultValues: { mes, valor_sem_iva: "", base: "mrr" },
  });
  const erro = formState.errors.valor_sem_iva?.message;
  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await guardarMetaDoMes(getValues());
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.objetivo.guardado }
          : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
      );
      if (r.ok) router.refresh();
    }),
  );
  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id="meta-mes" type="month" rotulo={t.objetivo.campos.mes} {...register("mes")} />
        <Campo
          id="meta-valor"
          inputMode="decimal"
          rotulo={t.objetivo.campos.valor}
          erro={erro ? (t.erros[erro] ?? t.erros.generico) : undefined}
          {...register("valor_sem_iva")}
        />
        <CampoEscolha
          id="meta-base"
          rotulo={t.objetivo.campos.base}
          opcoes={t.objetivo.bases}
          {...register("base")}
        />
      </div>
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.objetivo.guardar}
      </Button>
    </form>
  );
}
