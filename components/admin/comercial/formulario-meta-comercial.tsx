"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guardarMeta } from "@/app/(admin)/admin/(protegido)/comercial/acoes-desempenho";
import { CampoEscolha } from "@/components/admin/financas/campo-escolha";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosMetaComercial, esquemaMetaComercial } from "@/lib/validacao/desempenho";

const t = textos.comercial.desempenho;

/** Metas do mês de um comercial (D-161): leads novos, propostas e contratos assinados. */
export function FormularioMetaComercial({
  mes,
  comerciais,
}: {
  mes: string;
  comerciais: Record<string, string>;
}) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, getValues } = useForm<DadosMetaComercial>({
    resolver: zodResolver(esquemaMetaComercial),
    defaultValues: {
      userId: Object.keys(comerciais)[0] ?? "",
      mes,
      leadsNovos: 0,
      propostas: 0,
      ganhos: 0,
    },
  });
  const enviar = handleSubmit(
    () =>
      iniciar(async () => {
        const r = await guardarMeta(getValues());
        setAviso(
          r.ok ? { tipo: "sucesso", texto: t.metaGuardada } : { tipo: "erro", texto: t.erroMeta },
        );
        if (r.ok) router.refresh();
      }),
    () => setAviso({ tipo: "erro", texto: t.erroMeta }),
  );
  return (
    <form onSubmit={enviar} className="cartao grid gap-4 rounded-2xl p-4" noValidate>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <input type="hidden" {...register("mes")} />
      <div className="grid gap-4 sm:grid-cols-4">
        <CampoEscolha
          id="meta-comercial"
          rotulo={t.metasComercial}
          opcoes={comerciais}
          {...register("userId")}
        />
        <Campo id="meta-leads" type="number" rotulo={t.leadsNovos} {...register("leadsNovos")} />
        <Campo id="meta-propostas" type="number" rotulo={t.propostas} {...register("propostas")} />
        <Campo id="meta-ganhos" type="number" rotulo={t.ganhos} {...register("ganhos")} />
      </div>
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.guardarMeta}
      </Button>
    </form>
  );
}
