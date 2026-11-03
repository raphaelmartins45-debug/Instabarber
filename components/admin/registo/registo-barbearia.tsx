"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { registar } from "@/app/(admin)/admin/(protegido)/barbearias/nova/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import {
  type DadosRegistoBarbearia,
  esquemaRegistoBarbearia,
} from "@/lib/validacao/registo-barbearia";
import { CampoRegisto, ImplementacaoRegisto, SelecaoRegisto } from "./campos-registo";

const t = textos.admin.registo;

/**
 * Registar uma barbearia pelo painel (D-189): o essencial da barbearia, o plano, a implementação
 * (com o preço das condições comerciais) e a cortesia. Fica tudo no mesmo ecrã, em secções.
 */
export function RegistoBarbearia({ precosCent }: { precosCent: Record<string, number> }) {
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string; id?: string }>();
  const [aRegistar, iniciar] = useTransition();
  const form = useForm<DadosRegistoBarbearia>({
    resolver: zodResolver(esquemaRegistoBarbearia, undefined, { raw: true }),
    defaultValues: {
      nome: "",
      responsavel: "",
      nif: "",
      email_acesso: "",
      telefone: "",
      cidade: "",
      morada: "",
      plano: "pro",
      periodicidade: "mensal",
      profissionais: 3,
      implementacao: "essencial",
      valor_implementacao: textoDeCentimos(precosCent.essencial ?? 0),
      cortesia: false,
      cortesia_ate: "",
    },
  });
  const implementacao = form.watch("implementacao");
  const plano = form.watch("plano");
  // O valor acompanha o pacote escolhido (pode ajustar-se à mão) e o Basic tem 1 profissional.
  useEffect(() => {
    form.setValue("valor_implementacao", textoDeCentimos(precosCent[implementacao] ?? 0));
  }, [implementacao, precosCent, form]);
  useEffect(() => {
    form.setValue("profissionais", plano === "basic" ? 1 : 3);
  }, [plano, form]);
  const enviar = form.handleSubmit(
    () =>
      iniciar(async () => {
        const r = await registar(form.getValues());
        if (r.ok) {
          setAviso({
            tipo: "sucesso",
            texto: r.emailEnviado ? t.feito : t.feitoSemEmail,
            id: r.inquilinoId,
          });
          form.reset();
        } else setAviso({ tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! });
      }),
    () => setAviso({ tipo: "erro", texto: t.erros.obrigatorio! }),
  );
  const seccao = "cartao grid gap-4 rounded-2xl p-4";
  return (
    <form onSubmit={enviar} className="grid gap-5" noValidate data-testid="registo-barbearia">
      {aviso ? (
        <Aviso tipo={aviso.tipo}>
          {aviso.texto}{" "}
          {aviso.id ? (
            <Link className="font-semibold underline" href={`/admin/barbearias/${aviso.id}`}>
              {textos.admin.barbearias.abrir}
            </Link>
          ) : null}
        </Aviso>
      ) : null}
      <fieldset className={seccao}>
        <legend className="text-sm font-bold">{t.seccoes.barbearia}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoRegisto form={form} nome="nome" />
          <CampoRegisto form={form} nome="responsavel" />
          <CampoRegisto form={form} nome="email_acesso" tipo="email" />
          <CampoRegisto form={form} nome="telefone" tipo="tel" />
          <CampoRegisto form={form} nome="nif" />
          <CampoRegisto form={form} nome="cidade" />
          <div className="sm:col-span-2">
            <CampoRegisto form={form} nome="morada" />
          </div>
        </div>
      </fieldset>
      <fieldset className={seccao}>
        <legend className="text-sm font-bold">{t.seccoes.plano}</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelecaoRegisto form={form} nome="plano" opcoes={textos.admin.planos} />
          <SelecaoRegisto form={form} nome="periodicidade" opcoes={textos.admin.periodicidades} />
          <CampoRegisto form={form} nome="profissionais" tipo="number" />
        </div>
      </fieldset>
      <fieldset className={seccao}>
        <legend className="text-sm font-bold">{t.seccoes.implementacao}</legend>
        <ImplementacaoRegisto form={form} />
      </fieldset>
      <Button type="submit" disabled={aRegistar} className="justify-self-start">
        {aRegistar ? t.aRegistar : t.registar}
      </Button>
    </form>
  );
}
