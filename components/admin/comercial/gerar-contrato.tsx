"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { gerarDaProposta } from "@/app/(admin)/admin/(protegido)/comercial/acoes-contratos";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { type DadosContratante, esquemaContratante } from "@/lib/comercial/contrato";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.contratos;
const CAMPOS = [
  ["razao_social", "text"],
  ["nif", "text"],
  ["morada", "text"],
  ["representante", "text"],
  ["cargo", "text"],
  ["email", "email"],
  ["data_inicio", "date"],
] as const;

/**
 * Gerar o contrato da proposta aceite (N.6). Os dados do contratante vêm do briefing e o
 * operador confirma-os; o texto sai do modelo aprovado.
 */
export function GerarContrato({
  leadId,
  propostaId,
  numero,
  inicial,
}: {
  leadId: string;
  propostaId: string;
  numero: string;
  inicial: DadosContratante;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const { register, handleSubmit, formState } = useForm<DadosContratante>({
    resolver: zodResolver(esquemaContratante),
    defaultValues: inicial,
  });
  const enviar = handleSubmit((dados) =>
    iniciar(async () => {
      const r = await gerarDaProposta(leadId, propostaId, dados);
      if (!r.ok) {
        const base = t.erros[r.erro] ?? t.erros.generico;
        return setErro(r.detalhe ? `${base} ${r.detalhe}` : base);
      }
      setErro(undefined);
      router.refresh();
    }),
  );
  return (
    <form onSubmit={enviar} className="cartao grid gap-4 rounded-2xl p-5" noValidate>
      <div className="grid gap-1">
        <p className="font-semibold">{t.daProposta(numero)}</p>
        <p className="text-sm text-muted-foreground">{t.gerarAjuda}</p>
      </div>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPOS.map(([nome, tipo]) => {
          const e = formState.errors[nome]?.message;
          return (
            <Campo
              key={nome}
              id={`contrato-${nome}`}
              type={tipo}
              rotulo={t.campos[nome]!}
              erro={e ? (t.erros[e] ?? t.erros.generico) : undefined}
              {...register(nome)}
            />
          );
        })}
      </div>
      <Button type="submit" disabled={aGuardar} className="justify-self-start">
        {t.gerar}
      </Button>
    </form>
  );
}
