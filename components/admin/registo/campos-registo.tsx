import type { UseFormReturn } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { type Campanha, campanhasDisponiveis } from "@/lib/comercial/campanhas";
import { IMPLEMENTACOES } from "@/lib/comercial/condicoes";
import { hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { DadosRegistoBarbearia } from "@/lib/validacao/registo-barbearia";

const t = textos.admin.registo;
type Form = UseFormReturn<DadosRegistoBarbearia>;
type Nome = keyof DadosRegistoBarbearia & string;

const classeSelecao = "h-11 w-full min-w-0 rounded-md border border-input bg-campo px-3 text-sm";

/** Um campo de texto do registo, com o erro traduzido. */
export function CampoRegisto({
  form,
  nome,
  tipo = "text",
}: {
  form: Form;
  nome: Nome;
  tipo?: "text" | "email" | "tel" | "number" | "date";
}) {
  const e = form.formState.errors[nome]?.message;
  return (
    <Campo
      id={`registo-${nome}`}
      type={tipo}
      {...(nome === "valor_implementacao" ? { inputMode: "decimal" as const } : {})}
      rotulo={t.campos[nome]!}
      erro={e ? (t.erros[e] ?? t.erros.generico) : undefined}
      {...form.register(nome)}
    />
  );
}

/** Uma lista de escolha do registo. */
export function SelecaoRegisto({
  form,
  nome,
  opcoes,
}: {
  form: Form;
  nome: "plano" | "periodicidade" | "implementacao";
  opcoes: Record<string, string>;
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="rotulo">{t.campos[nome]}</span>
      <select id={`registo-${nome}`} {...form.register(nome)} className={classeSelecao}>
        {Object.entries(opcoes).map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Implementação, condição especial e cortesia, com o valor sugerido pelo pacote escolhido. */
export function ImplementacaoRegisto({ form, campanhas }: { form: Form; campanhas: Campanha[] }) {
  const implementacao = form.watch("implementacao");
  const cortesia = form.watch("cortesia");
  const disponiveis = campanhasDisponiveis(campanhas, form.watch("plano"), hojeIso());
  const tipos = Object.fromEntries(
    IMPLEMENTACOES.map((i) => [i, textos.admin.condicoesBarbearia.tipos[i]!]),
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelecaoRegisto form={form} nome="implementacao" opcoes={tipos} />
      {implementacao === "nenhuma" ? null : <CampoRegisto form={form} nome="valor_implementacao" />}
      {disponiveis.length ? (
        <label className="grid min-w-0 gap-1.5 sm:col-span-2">
          <span className="rotulo">{t.campos.campanha_id}</span>
          <select
            id="registo-campanha_id"
            {...form.register("campanha_id")}
            className={classeSelecao}
          >
            <option value="">{t.semCampanha}</option>
            {disponiveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input type="checkbox" className="size-4 accent-destaque" {...form.register("cortesia")} />
        {t.campos.cortesia}
      </label>
      {cortesia ? <CampoRegisto form={form} nome="cortesia_ate" tipo="date" /> : null}
    </div>
  );
}
