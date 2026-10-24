"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guardarCusto } from "@/app/(admin)/admin/(protegido)/financas/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosCusto, esquemaCusto } from "@/lib/validacao/financas";
import { CampoEscolha } from "./campo-escolha";

const t = textos.financas;

/** Criar ou editar um custo (O.4): valores sem IVA; o anual conta 1/12 por mês. */
export function FormularioCusto({ id, inicial }: { id?: string; inicial?: DadosCusto }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues, reset } = useForm<DadosCusto>({
    resolver: zodResolver(esquemaCusto),
    defaultValues: inicial ?? {
      descricao: "",
      categoria: "infraestrutura",
      tipo: "fixo",
      valor_sem_iva: "",
      periodicidade: "mensal",
      data_inicio: hojeIso(),
      data_fim: "",
      nota: "",
    },
  });
  const erro = (c: keyof DadosCusto) => {
    const m = formState.errors[c]?.message;
    return m ? (t.erros[m] ?? t.erros.generico) : undefined;
  };
  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await guardarCusto(id ?? null, getValues());
      if (!r.ok) return setAviso({ tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! });
      setAviso({ tipo: "sucesso", texto: t.custos.guardado });
      if (!id) reset();
      router.refresh();
    }),
  );
  const p = id ?? "novo";
  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate data-testid="formulario-custo">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id={`${p}-descricao`}
          rotulo={t.campos.descricao!}
          erro={erro("descricao")}
          {...register("descricao")}
        />
        <Campo
          id={`${p}-valor`}
          rotulo={t.campos.valor_sem_iva!}
          inputMode="decimal"
          erro={erro("valor_sem_iva")}
          {...register("valor_sem_iva")}
        />
        <CampoEscolha
          id={`${p}-categoria`}
          rotulo={t.campos.categoria!}
          opcoes={t.categorias}
          {...register("categoria")}
        />
        <CampoEscolha
          id={`${p}-tipo`}
          rotulo={t.campos.tipo!}
          opcoes={t.tipos}
          {...register("tipo")}
        />
        <CampoEscolha
          id={`${p}-periodicidade`}
          rotulo={t.campos.periodicidade!}
          opcoes={t.periodicidades}
          {...register("periodicidade")}
        />
        <Campo
          id={`${p}-inicio`}
          type="date"
          rotulo={t.campos.data_inicio!}
          erro={erro("data_inicio")}
          {...register("data_inicio")}
        />
        <Campo
          id={`${p}-fim`}
          type="date"
          rotulo={t.campos.data_fim!}
          erro={erro("data_fim")}
          {...register("data_fim")}
        />
        <Campo id={`${p}-nota`} rotulo={t.campos.nota!} {...register("nota")} />
      </div>
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.custos.guardar}
      </Button>
    </form>
  );
}
