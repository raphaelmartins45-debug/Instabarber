"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textoErro } from "@/lib/adesao/erros";
import { textos } from "@/lib/i18n/pt-PT";
import type { DadosPedidoAdesao } from "@/lib/validacao/adesao";

const t = textos.adesao.servicos;

/** Passo 3: serviços, equipa e modelo de caixa (D.8, F.4.11). */
export function PassoServicos() {
  const { register, control, formState } = useFormContext<DadosPedidoAdesao>();
  const e = formState.errors.servicos;
  const servicos = useFieldArray({ control, name: "servicos.servicos" });
  const equipa = useFieldArray({ control, name: "servicos.equipa" });

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <h3 className="text-[15px] font-bold">{t.titulo}</h3>
        <p className="text-sm text-muted-foreground">{t.ajuda}</p>
        {servicos.fields.map((f, i) => (
          <div
            key={f.id}
            className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_8rem_8rem_auto] sm:items-end"
          >
            <Campo
              id={`servico-${i}`}
              rotulo={t.nome}
              erro={textoErro(e?.servicos?.[i]?.nome?.message)}
              {...register(`servicos.servicos.${i}.nome`)}
            />
            <Campo
              id={`duracao-${i}`}
              rotulo={t.duracao}
              inputMode="numeric"
              erro={textoErro(e?.servicos?.[i]?.duracao_min?.message)}
              {...register(`servicos.servicos.${i}.duracao_min`)}
            />
            <Campo
              id={`preco-${i}`}
              rotulo={t.preco}
              inputMode="decimal"
              erro={textoErro(e?.servicos?.[i]?.preco?.message)}
              {...register(`servicos.servicos.${i}.preco`)}
            />
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              disabled={servicos.fields.length === 1}
              onClick={() => servicos.remove(i)}
            >
              {t.remover}
            </Button>
          </div>
        ))}
        <p className="text-sm text-destructive">
          {textoErro(e?.servicos?.root?.message ?? e?.servicos?.message)}
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-11 justify-self-start"
          onClick={() => servicos.append({ nome: "", duracao_min: "30", preco: "" })}
        >
          {t.acrescentar}
        </Button>
      </section>

      <section className="grid gap-3">
        <h3 className="text-[15px] font-bold">{t.equipa}</h3>
        <p className="text-sm text-muted-foreground">{t.equipaAjuda}</p>
        {equipa.fields.map((f, i) => (
          <div
            key={f.id}
            className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <Campo
              id={`membro-${i}`}
              rotulo={t.membroNome}
              erro={textoErro(e?.equipa?.[i]?.nome?.message)}
              {...register(`servicos.equipa.${i}.nome`)}
            />
            <Campo
              id={`membro-email-${i}`}
              rotulo={t.membroEmail}
              type="email"
              erro={textoErro(e?.equipa?.[i]?.email?.message)}
              {...register(`servicos.equipa.${i}.email`)}
            />
            <Button type="button" variant="ghost" className="h-11" onClick={() => equipa.remove(i)}>
              {t.remover}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="h-11 justify-self-start"
          onClick={() => equipa.append({ nome: "", email: "" })}
        >
          {t.acrescentarMembro}
        </Button>
      </section>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-[15px] font-bold">{t.caixa}</legend>
        <p className="text-sm text-muted-foreground">{t.caixaAjuda}</p>
        {(["A", "B", "C"] as const).map((m) => (
          <label
            key={m}
            className="flex min-h-11 items-center gap-3 rounded-lg border bg-card px-3 text-sm"
          >
            <input
              type="radio"
              value={m}
              className="size-4 accent-destaque"
              {...register("servicos.modelo_caixa")}
            />
            {t.modelos[m]}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
