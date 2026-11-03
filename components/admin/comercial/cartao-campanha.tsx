"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guardarCampanha } from "@/app/(admin)/admin/(protegido)/comercial/acoes-campanhas";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import type { Campanha } from "@/lib/comercial/campanhas";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosCampanha, esquemaCampanha } from "@/lib/validacao/campanhas";
import { resumoDaCampanha } from "./resumo-campanha";

const t = textos.comercial.campanhas;

/** Uma campanha (D-190): o que oferece (fixo) e o que a Performa LAB muda (ligar, data, vagas, texto). */
export function CartaoCampanha({ c }: { c: Campanha }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, getValues, formState } = useForm<DadosCampanha>({
    resolver: zodResolver(esquemaCampanha, undefined, { raw: true }),
    defaultValues: {
      ativa: c.ativa,
      nome: c.nome,
      texto: c.texto,
      valida_ate: c.valida_ate ?? "",
      vagas: c.vagas === null ? "" : String(c.vagas),
    },
  });
  const erro = (n: keyof DadosCampanha) => {
    const m = formState.errors[n]?.message;
    return m ? (t.erros[m] ?? t.erros.generico) : undefined;
  };
  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await guardarCampanha(c.id, getValues());
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
          : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
      );
      if (r.ok) router.refresh();
    }),
  );
  return (
    <form
      onSubmit={enviar}
      noValidate
      className="cartao grid gap-3 rounded-2xl p-4"
      data-testid="campanha"
      data-chave={c.chave}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">{c.nome}</h3>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="size-4 accent-destaque" {...register("ativa")} />
          {t.ativa}
        </label>
      </div>
      <ul className="grid gap-0.5 text-xs text-muted-foreground">
        {resumoDaCampanha(c).map((linha) => (
          <li key={linha}>{linha}</li>
        ))}
        <li>{t.usadas(c.usadas, c.vagas)}</li>
      </ul>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <Campo
        id={`campanha-nome-${c.id}`}
        rotulo={t.nome}
        erro={erro("nome")}
        {...register("nome")}
      />
      <label className="grid gap-1.5">
        <span className="rotulo">{t.texto}</span>
        <textarea
          rows={3}
          className="rounded-md border border-input bg-campo px-3 py-2 text-sm"
          {...register("texto")}
        />
        {erro("texto") ? <span className="text-xs text-destructive">{erro("texto")}</span> : null}
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo
          id={`campanha-data-${c.id}`}
          type="date"
          rotulo={t.validaAte}
          erro={erro("valida_ate")}
          {...register("valida_ate")}
        />
        <Campo
          id={`campanha-vagas-${c.id}`}
          inputMode="numeric"
          rotulo={t.vagas}
          erro={erro("vagas")}
          {...register("vagas")}
        />
      </div>
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.guardar}
      </Button>
    </form>
  );
}
