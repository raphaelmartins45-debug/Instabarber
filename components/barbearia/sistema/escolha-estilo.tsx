"use client";

import { LETRA_DO_ESTILO } from "@/components/publico/fontes";
import { textos } from "@/lib/i18n/pt-PT";
import { ACABAMENTO, ESTILOS, type Estilo } from "@/lib/publico/estilos";
import { corDoTexto } from "@/lib/regras/contraste";
import { cn } from "@/lib/utils";

const t = textos.sistema.marca;

/**
 * O modelo da página pública (D-198): cada opção mostra o nome da barbearia na letra do título
 * do modelo, sobre a cor da capa. Serve também de pré-visualização da cor.
 */
export function EscolhaEstilo({
  nome,
  cor,
  valor,
  aoMudar,
}: {
  nome: string;
  cor: string;
  valor: Estilo;
  aoMudar: (estilo: Estilo) => void;
}) {
  const texto = corDoTexto(cor);
  return (
    <fieldset className="grid gap-2" data-testid="pre-visualizacao">
      <legend className="text-mini font-semibold tracking-wide text-muted-foreground uppercase">
        {t.estilo}
      </legend>
      <p className="text-sm text-muted-foreground">{t.estiloAjuda}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ESTILOS.map((e) => (
          <label
            key={e}
            className={cn(
              "grid cursor-pointer gap-2 rounded-lg border-2 p-1.5 transition-colors",
              valor === e ? "border-foreground" : "border-transparent hover:border-borda-forte",
            )}
          >
            <input
              type="radio"
              name="estilo_pagina"
              value={e}
              checked={valor === e}
              onChange={() => aoMudar(e)}
              className="sr-only"
            />
            <span
              className="flex h-24 items-end overflow-hidden rounded-md px-4 pb-3"
              style={{ backgroundColor: cor, color: texto }}
            >
              <span
                className={cn(LETRA_DO_ESTILO[e], "truncate text-2xl leading-none")}
                style={{
                  textTransform: ACABAMENTO[e].maiusculas
                    ? "uppercase"
                    : ACABAMENTO[e].minusculas
                      ? "lowercase"
                      : "none",
                  fontWeight: ACABAMENTO[e].peso,
                  letterSpacing: `${ACABAMENTO[e].espacamento}em`,
                }}
                translate="no"
              >
                {nome}
              </span>
            </span>
            <span className="px-1 text-sm font-semibold">{t.estilos[e]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
