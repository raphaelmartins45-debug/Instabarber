"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { COMO_MARCAM } from "@/lib/comercial/briefing";
import { textos } from "@/lib/i18n/pt-PT";
import { type DadosNovoLead, TEMPERATURAS } from "@/lib/validacao/comercial";

const t = textos.comercial;
const classeSelect = "h-11 rounded-lg border border-input bg-card px-3 text-sm";

type Props = {
  register: UseFormRegister<DadosNovoLead>;
  errors: FieldErrors<DadosNovoLead>;
  erro: (codigo?: string) => string | undefined;
  /** Ao criar: pede a próxima ação com data e procura duplicados ao sair de certos campos. */
  novo: boolean;
  aoSairDeContacto?: () => void;
};

/** Ficha de prospeção do lead (D-174): quem atendeu, a barbearia, a situação e o seguimento. */
export function CamposProspecao({ register, errors, erro, novo, aoSairDeContacto }: Props) {
  const campo = (
    c: keyof DadosNovoLead & string,
    tipo = "text",
    extra: { inputMode?: "decimal" | "numeric"; ajuda?: string } = {},
  ) => (
    <Campo
      key={c}
      id={`lead-${c}`}
      rotulo={t.campos[c]!}
      type={tipo}
      autoComplete="off"
      inputMode={extra.inputMode}
      ajuda={extra.ajuda}
      erro={erro(errors[c]?.message)}
      {...register(c, ["instagram", "morada"].includes(c) ? { onBlur: aoSairDeContacto } : {})}
    />
  );
  const caixa = (c: "fala_com_decisor" | "consentimento_contacto", ajuda?: string) => (
    <div className="grid gap-1">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-destaque" {...register(c)} />
        {t.campos[c]}
      </label>
      {errors[c]?.message ? (
        <p className="text-sm text-destructive">{erro(errors[c]?.message)}</p>
      ) : ajuda ? (
        <p className="text-xs text-muted-foreground">{ajuda}</p>
      ) : null}
    </div>
  );
  const escolha = (
    c: "como_marcam" | "temperatura",
    opcoes: readonly string[],
    rotulos: Record<string, string>,
  ) => (
    <div className="grid gap-1.5">
      <label htmlFor={`lead-${c}`} className="rotulo">
        {t.campos[c]}
      </label>
      <select id={`lead-${c}`} {...register(c)} className={classeSelect}>
        <option value="">{t.prospecao.nenhuma}</option>
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {rotulos[o]}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <fieldset className="grid gap-4 border-t border-border pt-4" data-testid="ficha-prospecao">
      <legend className="sr-only">{t.prospecao.titulo}</legend>
      <div className="grid gap-1">
        <h3 className="text-sm font-semibold">{t.prospecao.titulo}</h3>
        <p className="text-xs text-muted-foreground">{t.prospecao.ajuda}</p>
      </div>
      <h4 className="rotulo">{t.prospecao.contacto}</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {campo("contacto_cargo")}
        <div className="self-end pb-2">{caixa("fala_com_decisor")}</div>
      </div>
      <h4 className="rotulo">{t.prospecao.barbearia}</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {campo("instagram")}
        {campo("morada")}
        {campo("cadeiras", "text", { inputMode: "numeric" })}
        {campo("google_nota", "text", { inputMode: "decimal" })}
        {campo("google_avaliacoes", "text", { inputMode: "numeric" })}
      </div>
      <h4 className="rotulo">{t.prospecao.situacao}</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {escolha("como_marcam", COMO_MARCAM, t.briefing.comoMarcam)}
        {campo("sistema_atual")}
        {campo("custo_atual", "text", { inputMode: "decimal" })}
        {campo("fim_contrato_atual", "date")}
      </div>
      <h4 className="rotulo">{t.prospecao.seguimento}</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {escolha("temperatura", TEMPERATURAS, t.prospecao.temperaturas)}
        {campo("origem_detalhe")}
        {novo ? campo("proxima_acao", "text", { ajuda: t.prospecao.seguimentoAjuda }) : null}
        {novo ? campo("proxima_acao_em", "date") : null}
      </div>
      {caixa("consentimento_contacto", t.prospecao.consentimentoAjuda)}
    </fieldset>
  );
}
