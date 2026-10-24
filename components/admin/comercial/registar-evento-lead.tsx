"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { registarEvento } from "@/app/(admin)/admin/(protegido)/comercial/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosEvento, esquemaEvento, TIPOS_EVENTO } from "@/lib/validacao/comercial";

const t = textos.comercial;

/** Nota, chamada ou mensagem (N.3): atualiza o último contacto e a próxima ação. */
export function RegistarEventoLead({ id }: { id: string }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues, reset } = useForm<DadosEvento>({
    resolver: zodResolver(esquemaEvento),
    defaultValues: { tipo: "chamada", texto: "", proxima_acao: "", proxima_acao_em: "" },
  });

  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await registarEvento(id, getValues());
      if (!r.ok) return setAviso({ tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! });
      reset();
      setAviso({ tipo: "sucesso", texto: t.ficha.registado });
      router.refresh();
    }),
  );

  return (
    <form onSubmit={enviar} noValidate className="grid gap-3">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <label className="grid gap-1.5">
        <span className="rotulo">{t.ficha.tipoEvento}</span>
        <select
          {...register("tipo")}
          className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
        >
          {TIPOS_EVENTO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {t.ficha.tipos[tipo]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="rotulo">{t.ficha.texto}</span>
        <textarea
          {...register("texto")}
          rows={3}
          className="rounded-lg border border-input bg-foreground/[.03] p-3 text-sm"
        />
        {formState.errors.texto ? (
          <span className="text-xs text-destructive">{t.erros.texto}</span>
        ) : null}
      </label>
      <Campo
        id="evento-proxima"
        rotulo={t.ficha.proximaAcao}
        autoComplete="off"
        {...register("proxima_acao")}
      />
      <Campo
        id="evento-data"
        rotulo={t.ficha.proximaAcaoEm}
        type="date"
        {...register("proxima_acao_em")}
      />
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.ficha.registarBotao}
      </Button>
    </form>
  );
}
