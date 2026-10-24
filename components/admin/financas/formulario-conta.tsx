"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { guardarConta } from "@/app/(admin)/admin/(protegido)/financas/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosConta, esquemaConta } from "@/lib/validacao/financas";

const t = textos.financas;

/** Criar ou editar uma conta a pagar (O.4): valor sem e com IVA e vencimento. */
export function FormularioConta({ id, inicial }: { id?: string; inicial?: DadosConta }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState, getValues, reset } = useForm<DadosConta>({
    resolver: zodResolver(esquemaConta),
    defaultValues: inicial ?? {
      fornecedor: "",
      descricao: "",
      valor_sem_iva: "",
      valor_com_iva: "",
      vencimento: hojeIso(),
      nota: "",
    },
  });
  const erro = (c: keyof DadosConta) => {
    const m = formState.errors[c]?.message;
    return m ? (t.erros[m] ?? t.erros.generico) : undefined;
  };
  const enviar = handleSubmit(() =>
    iniciar(async () => {
      const r = await guardarConta(id ?? null, getValues());
      if (!r.ok) return setAviso({ tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! });
      setAviso({ tipo: "sucesso", texto: t.contas.guardada });
      if (!id) reset();
      router.refresh();
    }),
  );
  const p = `conta-${id ?? "nova"}`;
  return (
    <form onSubmit={enviar} className="grid gap-4" noValidate data-testid="formulario-conta">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id={`${p}-fornecedor`}
          rotulo={t.campos.fornecedor!}
          erro={erro("fornecedor")}
          {...register("fornecedor")}
        />
        <Campo id={`${p}-descricao`} rotulo={t.campos.descricao!} {...register("descricao")} />
        <Campo
          id={`${p}-sem`}
          rotulo={t.campos.valor_sem_iva!}
          inputMode="decimal"
          erro={erro("valor_sem_iva")}
          {...register("valor_sem_iva")}
        />
        <Campo
          id={`${p}-com`}
          rotulo={t.campos.valor_com_iva!}
          inputMode="decimal"
          erro={erro("valor_com_iva")}
          {...register("valor_com_iva")}
        />
        <Campo
          id={`${p}-vencimento`}
          type="date"
          rotulo={t.campos.vencimento!}
          erro={erro("vencimento")}
          {...register("vencimento")}
        />
        <Campo id={`${p}-nota`} rotulo={t.campos.nota!} {...register("nota")} />
      </div>
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.contas.guardar}
      </Button>
    </form>
  );
}
