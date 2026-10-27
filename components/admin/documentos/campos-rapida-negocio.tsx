import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { COMO_MARCAM, DORES } from "@/lib/comercial/briefing";
import { textos } from "@/lib/i18n/pt-PT";
import type { DadosPropostaRapida } from "@/lib/validacao/documentos";
import { GrupoOpcoes } from "./grupo-opcoes";

const t = textos.documentos.rapida;
const b = textos.comercial.briefing;

/** A barbearia na proposta rápida: números, como marcam, as dores e o objetivo. */
export function CamposRapidaNegocio({
  register,
  erros,
}: {
  register: UseFormRegister<DadosPropostaRapida>;
  erros: FieldErrors<DadosPropostaRapida>;
}) {
  const erro = (c?: string) => (c ? (t.erros[c] ?? t.erros.generico) : undefined);
  const numeros = [
    ["n_barbeiros", "numeric"],
    ["clientes_ativos", "numeric"],
    ["valor_visita", "decimal"],
    ["faltas_semana", "numeric"],
    ["clientes_perdidos", "numeric"],
  ] as const;
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="mb-2 text-base font-semibold">{t.barbearia}</legend>
      {numeros.map(([c, modo]) => (
        <Campo
          key={c}
          id={`rapida-${c}`}
          rotulo={t.campos[c]!}
          inputMode={modo}
          erro={erro(erros[c]?.message)}
          {...register(c)}
        />
      ))}
      <div className="sm:col-span-2">
        <GrupoOpcoes
          legenda={t.campos.como_marcam!}
          opcoes={COMO_MARCAM.map((id) => ({ id, rotulo: b.comoMarcam[id]! }))}
          registo={register("como_marcam")}
          erro={erro(erros.como_marcam?.message)}
        />
      </div>
      <div className="sm:col-span-2">
        <GrupoOpcoes
          legenda={t.campos.dores!}
          opcoes={DORES.map((id) => ({ id, rotulo: b.dores[id]! }))}
          registo={register("dores")}
          erro={erro(erros.dores?.message)}
        />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <label htmlFor="rapida-objetivo" className="rotulo">
          {t.campos.objetivo}
        </label>
        <textarea
          id="rapida-objetivo"
          rows={2}
          aria-invalid={!!erros.objetivo}
          className="rounded-md border border-input bg-foreground/[.03] px-3 py-2 text-sm"
          {...register("objetivo")}
        />
        {erros.objetivo ? (
          <p className="text-sm text-destructive">{erro(erros.objetivo.message)}</p>
        ) : null}
      </div>
    </fieldset>
  );
}
