"use client";

import Link from "next/link";
import { useFormContext, useWatch } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { decomposicao, listaIncluida, type Catalogo, type Pacotes } from "@/lib/adesao/resumo";
import { textoErro } from "@/lib/adesao/erros";
import { textos } from "@/lib/i18n/pt-PT";
import { calcularPrecoCent, INCLUIDOS, type RegimeIva } from "@/lib/regras/mensalidade";
import { cn } from "@/lib/utils";
import type { DadosPedidoAdesao } from "@/lib/validacao/adesao";
import { CaixaPreco } from "./caixa-preco";
import { SeletorProfissionais } from "./seletor-profissionais";

const t = textos.adesao.contratacao;
const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";

/** Passo 4: plano, periodicidade, profissionais, preço, o que fica incluído e confirmação (D.6, D.9, D.13). */
export function PassoContratacao({
  catalogo,
  pacotes,
  regime,
}: {
  catalogo: Catalogo;
  pacotes: Pacotes;
  regime: RegimeIva;
}) {
  const { register, setValue, control, formState } = useFormContext<DadosPedidoAdesao>();
  const e = formState.errors.contratacao;
  const [plano = "pro", periodicidade = "mensal", profissionais = INCLUIDOS.pro] = useWatch({
    control,
    name: ["contratacao.plano", "contratacao.periodicidade", "contratacao.profissionais"],
  });
  const escolha = { plano, periodicidade, profissionais };
  const preco = calcularPrecoCent(plano, profissionais, periodicidade, false, regime);

  return (
    <div className="grid gap-5">
      <fieldset className="grid gap-2">
        <legend className={cn(etiqueta, "mb-1.5")}>{t.plano}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["basic", "pro"] as const).map((p) => (
            <label
              key={p}
              className="flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 font-semibold has-checked:border-primary"
            >
              <input
                type="radio"
                value={p}
                className="size-4"
                {...register("contratacao.plano", {
                  onChange: () => setValue("contratacao.profissionais", INCLUIDOS[p]),
                })}
              />
              {t.planos[p]}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className={cn(etiqueta, "mb-1.5")}>{t.periodicidade}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["mensal", "anual"] as const).map((p) => (
            <label
              key={p}
              className="flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 has-checked:border-primary"
            >
              <input
                type="radio"
                value={p}
                className="size-4"
                {...register("contratacao.periodicidade")}
              />
              {t.periodicidades[p]}
            </label>
          ))}
        </div>
      </fieldset>
      <SeletorProfissionais
        plano={plano}
        valor={profissionais}
        aoMudar={(n) => setValue("contratacao.profissionais", n)}
      />
      <CaixaPreco
        preco={preco}
        anual={periodicidade === "anual"}
        regimeIsento={regime === "isento"}
        linhas={decomposicao(escolha)}
      />

      <section className="grid gap-2">
        <h3 className="text-[15px] font-bold">
          {t.incluido} · {t.planos[plano]}
        </h3>
        <ul className="grid gap-1 text-sm sm:grid-cols-2" data-testid="lista-incluida">
          {listaIncluida(catalogo, pacotes, plano).map((f) => (
            <li key={f.chave} className={cn(!f.incluida && "text-muted-foreground/60")}>
              {f.incluida ? "✓" : "–"} {f.nome}
              {f.incluida ? null : <span className="text-xs"> ({t.soPro})</span>}
            </li>
          ))}
        </ul>
      </section>

      <fieldset className="grid gap-2">
        <legend className={cn(etiqueta, "mb-1")}>{t.pagamento}</legend>
        <p className="text-sm text-muted-foreground">{t.pagamentoAjuda}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["mbway", "transferencia", "dinheiro"] as const).map((p) => (
            <label
              key={p}
              className="flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 has-checked:border-primary"
            >
              <input
                type="radio"
                value={p}
                className="size-4"
                {...register("contratacao.preferencia_pagamento")}
              />
              {t.pagamentos[p]}
            </label>
          ))}
        </div>
      </fieldset>
      <Campo
        id="email-acesso"
        rotulo={t.emailAcesso}
        type="email"
        ajuda={t.emailAcessoAjuda}
        erro={textoErro(e?.email_acesso?.message)}
        {...register("contratacao.email_acesso")}
      />
      <Campo id="observacoes" rotulo={t.observacoes} {...register("contratacao.observacoes")} />
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-5"
          {...register("contratacao.aceitou_termos")}
        />
        <span>
          {t.aceito}{" "}
          <Link href="/termos" target="_blank" className="text-ligacao underline">
            {textos.legal.termos}
          </Link>
          {t.virgula}{" "}
          <Link href="/privacidade" target="_blank" className="text-ligacao underline">
            {textos.legal.privacidade}
          </Link>{" "}
          {t.e}{" "}
          <Link href="/termos/subcontratacao" target="_blank" className="text-ligacao underline">
            {textos.legal.subcontratacao}
          </Link>
          .
        </span>
      </label>
      {e?.aceitou_termos ? (
        <p className="text-sm text-destructive">{textoErro(e.aceitou_termos.message)}</p>
      ) : null}
    </div>
  );
}
