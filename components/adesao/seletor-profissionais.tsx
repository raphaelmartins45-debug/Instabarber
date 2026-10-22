"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { EXTRA_CENT, INCLUIDOS, profissionaisExtra, type Plano } from "@/lib/regras/mensalidade";

const t = textos.adesao.contratacao;

/** Seletor de profissionais (D.6): fixo em 1 no Basic; no Pro, mais e menos com mínimo de 3. */
export function SeletorProfissionais({
  plano,
  valor,
  aoMudar,
}: {
  plano: Plano;
  valor: number;
  aoMudar: (n: number) => void;
}) {
  const { extras, valorCent } = profissionaisExtra(plano, valor);
  return (
    <div className="grid gap-2">
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {t.profissionais}
      </span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={t.menos}
          disabled={plano === "basic" || valor <= INCLUIDOS.pro}
          onClick={() => aoMudar(valor - 1)}
        >
          <Minus />
        </Button>
        <output
          aria-live="polite"
          data-testid="profissionais"
          className="min-w-8 text-center text-xl font-bold"
        >
          {valor}
        </output>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={t.mais}
          disabled={plano === "basic"}
          onClick={() => aoMudar(valor + 1)}
        >
          <Plus />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {plano === "basic"
          ? t.basicUm
          : t.contaExtras(
              INCLUIDOS.pro,
              extras,
              formatarDinheiro(EXTRA_CENT.pro),
              formatarDinheiro(valorCent),
            )}
      </p>
    </div>
  );
}
