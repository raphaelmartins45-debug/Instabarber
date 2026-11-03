"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { publicarComunicado } from "@/app/(admin)/admin/(protegido)/comunicados/acoes";
import { CampoEscolha } from "@/components/admin/financas/campo-escolha";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosComunicado, esquemaComunicado } from "@/lib/validacao/gestao";
import { CampoTextoLongo } from "./campo-texto-longo";

const t = textos.gestao.comunicados;

/**
 * Novo comunicado (D-160, D-191): às barbearias (todas, um plano ou uma) ou à equipa InstaBarber
 * (os comerciais ou os gestores, todos ou uma pessoa).
 */
export function FormularioComunicado({
  hoje,
  barbearias,
  comerciais,
  gestores,
}: {
  hoje: string;
  barbearias: Record<string, string>;
  /** As pessoas de cada grupo da equipa (D-191), para escolher uma. */
  comerciais: Record<string, string>;
  gestores: Record<string, string>;
}) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const vazio: DadosComunicado = {
    titulo: "",
    texto: "",
    destino: "todas",
    plano: "",
    inquilino_id: "",
    destinatario_id: "",
    inicio: hoje,
    fim: "",
  };
  const { register, handleSubmit, formState, getValues, reset, watch } = useForm<DadosComunicado>({
    resolver: zodResolver(esquemaComunicado),
    defaultValues: vazio,
  });
  const destino = watch("destino");
  const erro = (c: keyof DadosComunicado) => {
    const m = formState.errors[c]?.message;
    return m ? (t.erros[m] ?? t.erros.generico) : undefined;
  };
  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await publicarComunicado(getValues());
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
          : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
      );
      if (r.ok) {
        reset(vazio);
        router.refresh();
      }
    }),
  );
  return (
    <form onSubmit={enviar} className="cartao grid gap-4 rounded-2xl p-4" noValidate>
      <h2 className="text-secao font-bold">{t.novo}</h2>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <Campo
        id="com-titulo"
        rotulo={t.campos.titulo}
        erro={erro("titulo")}
        {...register("titulo")}
      />
      <CampoTextoLongo
        id="com-texto"
        rotulo={t.campos.texto}
        erro={erro("texto")}
        {...register("texto")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoEscolha
          id="com-destino"
          rotulo={t.campos.destino}
          opcoes={t.destinos}
          {...register("destino")}
        />
        {destino === "plano" ? (
          <CampoEscolha
            id="com-plano"
            rotulo={t.campos.plano}
            opcoes={{ "": "", ...textos.admin.planos }}
            {...register("plano")}
          />
        ) : null}
        {destino === "comerciais" || destino === "gestores" ? (
          <CampoEscolha
            id="com-pessoa"
            rotulo={t.campos.pessoa}
            opcoes={{ "": t.todosDoGrupo, ...(destino === "comerciais" ? comerciais : gestores) }}
            {...register("destinatario_id")}
          />
        ) : null}
        {destino === "barbearia" ? (
          <CampoEscolha
            id="com-barbearia"
            rotulo={t.campos.barbearia}
            opcoes={{ "": "", ...barbearias }}
            {...register("inquilino_id")}
          />
        ) : null}
      </div>
      {erro("plano") || erro("inquilino_id") ? (
        <p className="text-sm text-destructive">{erro("plano") ?? erro("inquilino_id")}</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="com-inicio" type="date" rotulo={t.campos.inicio} {...register("inicio")} />
        <Campo
          id="com-fim"
          type="date"
          rotulo={t.campos.fim}
          erro={erro("fim")}
          {...register("fim")}
        />
      </div>
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.guardar}
      </Button>
    </form>
  );
}
