"use client";

import type { UseFormReturn } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import type { CampoFicha as DefinicaoCampo } from "@/lib/admin/ficha";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

const rotulos: Record<string, string> = textos.admin.ficha.campos;
const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";
const TIPOS_INPUT: Record<string, string> = {
  hora: "time",
  data: "date",
  cor: "color",
  url: "url",
  email: "email",
  tel: "tel",
};

/** Um campo da ficha, desenhado conforme o tipo. */
export function CampoFicha({
  campo,
  form,
  erro,
}: {
  campo: DefinicaoCampo;
  form: UseFormReturn<Record<string, unknown>>;
  erro?: string;
}) {
  const rotulo = campo.rotulo ?? rotulos[campo.nome] ?? campo.nome;
  const id = `campo-${campo.nome}`;
  if (campo.tipo === "booleano") {
    return (
      <div className="grid gap-1 sm:col-span-2">
        <label className="flex min-h-11 items-center gap-3 rounded-lg border bg-card px-3 text-sm">
          <input id={id} type="checkbox" className="size-5" {...form.register(campo.nome)} />
          {rotulo}
        </label>
        {campo.ajuda ? <p className="text-xs text-muted-foreground">{campo.ajuda}</p> : null}
      </div>
    );
  }
  if (campo.tipo === "dias") {
    const dias = (form.watch(campo.nome) as number[]) ?? [];
    const alternar = (d: number) =>
      form.setValue(
        campo.nome,
        dias.includes(d) ? dias.filter((x) => x !== d) : [...dias, d].sort(),
        { shouldDirty: true },
      );
    return (
      <fieldset className="grid gap-2 sm:col-span-2">
        <legend className={cn(etiqueta, "mb-1.5")}>{rotulo}</legend>
        <div className="flex flex-wrap gap-2">
          {textos.adesao.contactos.dias.map((nome, i) => (
            <button
              key={nome}
              type="button"
              aria-pressed={dias.includes(i)}
              onClick={() => alternar(i)}
              className={cn(
                "min-h-11 rounded-md border px-3 text-sm",
                dias.includes(i) ? "border-primary bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              {nome}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }
  if (campo.tipo === "selecao") {
    return (
      <label className="grid gap-1.5 text-sm">
        <span className={etiqueta}>{rotulo}</span>
        <select
          id={id}
          className="h-11 rounded-md border bg-card px-3"
          {...form.register(campo.nome)}
        >
          {campo.opcoes?.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        {erro ? <span className="text-sm text-destructive">{erro}</span> : null}
      </label>
    );
  }
  return (
    <div className={cn(campo.tipo === "longo" && "sm:col-span-2")}>
      <Campo
        id={id}
        rotulo={rotulo}
        type={TIPOS_INPUT[campo.tipo] ?? "text"}
        inputMode={campo.tipo === "numero" ? "numeric" : undefined}
        ajuda={campo.ajuda}
        erro={erro}
        {...form.register(campo.nome)}
      />
    </div>
  );
}
