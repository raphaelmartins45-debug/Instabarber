"use client";

import { useState } from "react";
import { Campo } from "@/components/nucleo/campo";
import { Selecao } from "@/components/nucleo/selecao";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Plano, RegimeIva } from "@/lib/regras/mensalidade";
import { simularPreco } from "@/lib/regras/vendas";
import { AcoesTexto } from "./acoes-texto";

const t = textos.vendas.simulador;

/** Simulador de preço (D-181): a fórmula única da mensalidade, com o texto pronto a enviar. */
export function SimuladorPreco({ regime }: { regime: RegimeIva }) {
  const [plano, setPlano] = useState<Plano>("pro");
  const [barbeiros, setBarbeiros] = useState("3");
  const [dominio, setDominio] = useState(false);
  const s = simularPreco(plano, Number(barbeiros), dominio, regime);
  const [mensal, anual, poupa] = [s.mensalCent, s.anualCent, s.poupancaAnualCent].map(
    formatarDinheiro,
  ) as [string, string, string];
  return (
    <div className="grid gap-4" data-testid="simulador-preco">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Selecao
          id="simulador-plano"
          rotulo={t.plano}
          valor={plano}
          aoMudar={(v) => setPlano(v as Plano)}
          opcoes={(["basic", "pro"] as const).map((p) => ({ id: p, rotulo: t.planos[p] }))}
        />
        <Campo
          id="simulador-barbeiros"
          rotulo={t.barbeiros}
          ajuda={t.barbeirosAjuda}
          type="number"
          inputMode="numeric"
          min={1}
          max={50}
          value={plano === "basic" ? "1" : barbeiros}
          disabled={plano === "basic"}
          onChange={(e) => setBarbeiros(e.target.value)}
        />
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4"
          checked={dominio}
          onChange={(e) => setDominio(e.target.checked)}
        />
        {t.dominio}
      </label>
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          <dt className="rotulo">{t.mensal}</dt>
          <dd className="numero text-xl font-extrabold" data-testid="simulador-mensal">
            {mensal}
          </dd>
        </div>
        <div className="rounded-xl border p-3">
          <dt className="rotulo">{t.anual}</dt>
          <dd className="numero text-xl font-extrabold">{anual}</dd>
        </div>
      </dl>
      <p className="text-sm">
        {t.poupa(poupa)} {t.iva[regime]}
      </p>
      <AcoesTexto
        texto={t.texto(t.planos[plano], s.profissionais, mensal, anual, poupa, t.iva[regime])}
      />
    </div>
  );
}
