"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guardar } from "@/app/(admin)/admin/(protegido)/comercial/acoes-condicoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosCondicoes, esquemaCondicoes } from "@/lib/validacao/condicoes";

const t = textos.comercial.condicoes;

/** Interruptores e limites dos descontos e da taxa de migração (D-161). */
export function FormularioCondicoes({ inicial }: { inicial: DadosCondicoes }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues } = useForm<DadosCondicoes>({
    resolver: zodResolver(esquemaCondicoes),
    defaultValues: inicial,
  });
  const erro = (c: keyof DadosCondicoes) => {
    const m = formState.errors[c]?.message;
    return m ? (t.erros[m] ?? t.erros.generico) : undefined;
  };
  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await guardar(getValues());
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
          : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
      );
      if (r.ok) router.refresh();
    }),
  );
  const interruptor = (nome: "descontosAtivos" | "taxaAtiva") => (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input type="checkbox" className="size-4 accent-destaque" {...register(nome)} />
      {t[nome]}
    </label>
  );
  return (
    <form onSubmit={enviar} className="grid gap-5" noValidate>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <fieldset className="cartao grid gap-4 rounded-2xl p-4">
        {interruptor("descontosAtivos")}
        <Campo
          id="cond-max-mensalidade"
          type="number"
          rotulo={t.descontoMaxMensalidade}
          erro={erro("descontoMaxMensalidade")}
          {...register("descontoMaxMensalidade")}
        />
      </fieldset>
      <fieldset className="cartao grid gap-4 rounded-2xl p-4">
        {interruptor("taxaAtiva")}
        <Campo
          id="cond-taxa"
          inputMode="decimal"
          rotulo={t.taxaBase}
          ajuda={t.taxaAjuda}
          erro={erro("taxaBase")}
          {...register("taxaBase")}
        />
        <Campo
          id="cond-max-taxa"
          type="number"
          rotulo={t.descontoMaxTaxa}
          erro={erro("descontoMaxTaxa")}
          {...register("descontoMaxTaxa")}
        />
      </fieldset>
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.guardar}
      </Button>
    </form>
  );
}
