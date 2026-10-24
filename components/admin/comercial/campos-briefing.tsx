"use client";

import type { UseFormReturn } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { type DadosBriefing } from "@/lib/comercial/briefing";
import { textos } from "@/lib/i18n/pt-PT";

const c = textos.comercial.briefing.campos;
type Form = UseFormReturn<DadosBriefing>;
type Chave = keyof DadosBriefing & string;

/** Campo de texto ou número do briefing, com o rótulo da N.4. */
export function CampoBriefing({
  form,
  nome,
  tipo = "text",
}: {
  form: Form;
  nome: Chave;
  tipo?: "text" | "number" | "email" | "tel" | "date";
}) {
  return (
    <Campo
      id={`briefing-${nome}`}
      rotulo={c[nome] ?? nome}
      type={tipo}
      autoComplete="off"
      {...form.register(
        nome,
        tipo === "number" ? { setValueAs: (v) => (v === "" ? undefined : Number(v)) } : {},
      )}
    />
  );
}

/** Grupo de escolhas múltiplas (como marcam, dores). */
export function EscolhasBriefing({
  form,
  nome,
  opcoes,
}: {
  form: Form;
  nome: "como_marcam" | "dores";
  opcoes: Record<string, string>;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="rotulo mb-1">{c[nome]}</legend>
      <div className="flex flex-wrap gap-2">
        {Object.entries(opcoes).map(([valor, rotulo]) => (
          <label
            key={valor}
            className="flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent"
          >
            <input
              type="checkbox"
              value={valor}
              className="accent-destaque"
              {...form.register(nome)}
            />
            {rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Interruptor simples (domínio próprio, desafio de 90 dias). */
export function CaixaBriefing({
  form,
  nome,
}: {
  form: Form;
  nome: "dominio_proprio" | "desafio_90";
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-sm">
      <input type="checkbox" className="size-4 accent-destaque" {...form.register(nome)} />
      {c[nome]}
    </label>
  );
}

/** Seleção com as opções dadas. */
export function SelecaoBriefing({
  form,
  nome,
  opcoes,
}: {
  form: Form;
  nome: "plano" | "periodicidade" | "modelo_caixa";
  opcoes: Record<string, string>;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="rotulo">{c[nome]}</span>
      <select
        {...form.register(
          nome,
          nome === "modelo_caixa" ? { setValueAs: (v) => v || undefined } : {},
        )}
        className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
      >
        {nome === "modelo_caixa" ? <option value="">{textos.comum.vazio}</option> : null}
        {Object.entries(opcoes).map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}
