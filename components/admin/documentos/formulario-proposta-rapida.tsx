"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { type Resolver, useForm } from "react-hook-form";
import {
  propostaRapida,
  type ResultadoPropostaRapida,
} from "@/app/(admin)/admin/(protegido)/documentos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosPropostaRapida, esquemaPropostaRapida } from "@/lib/validacao/documentos";
import { CamposRapidaContacto } from "./campos-rapida-contacto";
import { CamposRapidaNegocio } from "./campos-rapida-negocio";

const t = textos.documentos.rapida;
const b = textos.comercial.briefing;

const VAZIO: DadosPropostaRapida = {
  nome_contacto: "",
  nome_barbearia: "",
  cidade: "",
  telefone: "",
  email: "",
  origem: "visita",
  consentimento_contacto: false,
  n_barbeiros: "",
  como_marcam: [],
  clientes_ativos: "",
  valor_visita: "",
  faltas_semana: "",
  clientes_perdidos: "",
  dores: [],
  objetivo: "",
  plano: "pro",
  profissionais: "3",
  periodicidade: "mensal",
  dominio_proprio: false,
  proxima_acao: "",
  proxima_acao_em: "",
};

const seletor = "h-11 rounded-md border border-input bg-foreground/[.03] px-3 text-sm";

/** Proposta para um lead novo (D-181): cria o lead e o briefing e gera a proposta de uma vez. */
export function FormularioPropostaRapida() {
  const [resultado, setResultado] = useState<ResultadoPropostaRapida>();
  const [aGerar, iniciar] = useTransition();
  const { register, handleSubmit, formState } = useForm<DadosPropostaRapida>({
    // Os valores vão como foram escritos: o servidor valida-os outra vez com o mesmo esquema.
    resolver: zodResolver(esquemaPropostaRapida, undefined, {
      raw: true,
    }) as Resolver<DadosPropostaRapida>,
    defaultValues: VAZIO,
  });
  const erros = formState.errors;
  const erro = (c?: string) => (c ? (t.erros[c] ?? t.erros.generico) : undefined);

  if (resultado?.ok)
    return (
      <div className="grid gap-3" data-testid="proposta-rapida-feita">
        <Aviso tipo={resultado.propostaId ? "sucesso" : "erro"}>
          {resultado.propostaId ? t.feito : t.semProposta}
        </Aviso>
        <div className="flex flex-wrap gap-2">
          {resultado.propostaId ? (
            <Button asChild>
              <a href={`/admin/comercial/propostas/${resultado.propostaId}/pdf`}>{t.pdf}</a>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href={`/admin/comercial/leads/${resultado.leadId}`}>{t.ficha}</Link>
          </Button>
        </div>
      </div>
    );

  return (
    <form
      noValidate
      className="grid gap-6"
      onSubmit={handleSubmit((dados) =>
        iniciar(async () => setResultado(await propostaRapida(dados))),
      )}
    >
      {resultado && !resultado.ok ? (
        <Aviso tipo="erro">{t.erros[resultado.erro] ?? t.erros.generico}</Aviso>
      ) : null}
      <CamposRapidaContacto register={register} erros={erros} />
      <CamposRapidaNegocio register={register} erros={erros} />
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-base font-semibold">{t.plano}</legend>
        {(["plano", "periodicidade"] as const).map((c) => (
          <div key={c} className="grid gap-1.5">
            <label htmlFor={`rapida-${c}`} className="rotulo">
              {t.campos[c]}
            </label>
            <select id={`rapida-${c}`} className={seletor} {...register(c)}>
              {Object.entries(c === "plano" ? b.planos : b.periodicidades).map(([id, r]) => (
                <option key={id} value={id}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
        <Campo
          id="rapida-profissionais"
          rotulo={t.campos.profissionais!}
          inputMode="numeric"
          erro={erro(erros.profissionais?.message)}
          {...register("profissionais")}
        />
        <label className="flex min-h-11 items-center gap-2 self-end text-sm">
          <input type="checkbox" className="size-4" {...register("dominio_proprio")} />
          {t.campos.dominio_proprio}
        </label>
      </fieldset>
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-base font-semibold">{t.seguimento}</legend>
        <Campo
          id="rapida-proxima_acao"
          rotulo={t.campos.proxima_acao!}
          erro={erro(erros.proxima_acao?.message)}
          {...register("proxima_acao")}
        />
        <Campo
          id="rapida-proxima_acao_em"
          rotulo={t.campos.proxima_acao_em!}
          type="date"
          erro={erro(erros.proxima_acao_em?.message)}
          {...register("proxima_acao_em")}
        />
      </fieldset>
      <Button type="submit" disabled={aGerar} className="justify-self-start">
        {aGerar ? t.aGerar : t.gerar}
      </Button>
    </form>
  );
}
