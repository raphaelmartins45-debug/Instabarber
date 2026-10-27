import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { textos } from "@/lib/i18n/pt-PT";
import { ORIGENS } from "@/lib/validacao/comercial";
import type { DadosPropostaRapida } from "@/lib/validacao/documentos";

const t = textos.documentos.rapida;
const origens = textos.comercial.origens;

/** Contacto da proposta rápida: quem decide, a barbearia, a origem e o consentimento. */
export function CamposRapidaContacto({
  register,
  erros,
}: {
  register: UseFormRegister<DadosPropostaRapida>;
  erros: FieldErrors<DadosPropostaRapida>;
}) {
  const erro = (c?: string) => (c ? (t.erros[c] ?? t.erros.generico) : undefined);
  const campos = ["nome_contacto", "nome_barbearia", "cidade", "telefone", "email"] as const;
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="mb-2 text-base font-semibold">{t.contacto}</legend>
      {campos.map((c) => (
        <Campo
          key={c}
          id={`rapida-${c}`}
          rotulo={t.campos[c]!}
          type={c === "email" ? "email" : c === "telefone" ? "tel" : "text"}
          autoComplete={c === "telefone" ? "tel" : c === "email" ? "email" : "off"}
          erro={erro(erros[c]?.message)}
          {...register(c)}
        />
      ))}
      <div className="grid gap-1.5">
        <label htmlFor="rapida-origem" className="rotulo">
          {t.campos.origem}
        </label>
        <select
          id="rapida-origem"
          className="h-11 rounded-md border border-input bg-foreground/[.03] px-3 text-sm"
          {...register("origem")}
        >
          {ORIGENS.filter((o) => o !== "landing").map((o) => (
            <option key={o} value={o}>
              {origens[o]}
            </option>
          ))}
        </select>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" className="size-4" {...register("consentimento_contacto")} />
        {t.campos.consentimento_contacto}
      </label>
      {erros.consentimento_contacto ? (
        <p className="text-sm text-destructive sm:col-span-2">
          {erro(erros.consentimento_contacto.message)}
        </p>
      ) : null}
    </fieldset>
  );
}
