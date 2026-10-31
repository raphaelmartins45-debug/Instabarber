"use client";

import { useState } from "react";
import { ContadorNumero } from "@/components/nucleo/contador-numero";
import { Segmentado } from "@/components/nucleo/segmentado";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Plano, RegimeIva } from "@/lib/regras/mensalidade";
import { decomporMensalidade, simularPreco } from "@/lib/regras/vendas";
import { AcoesTexto } from "./acoes-texto";

const t = textos.vendas.simulador;
const v = textos.vendas;

/**
 * Simulador de preço (D-181): plano em segmentos, barbeiros com − e +, o valor mensal e o anual
 * lado a lado e a decomposição do mensal. A fórmula é a única da mensalidade.
 */
export function SimuladorPreco({ regime }: { regime: RegimeIva }) {
  const [plano, setPlano] = useState<Plano>("pro");
  const [barbeiros, setBarbeiros] = useState(3);
  const [dominio, setDominio] = useState(false);
  const s = simularPreco(plano, barbeiros, dominio, regime);
  const linhas = decomporMensalidade(plano, barbeiros, dominio, regime);
  const [mensal, anual, poupa] = [s.mensalCent, s.anualCent, s.poupancaAnualCent].map(
    formatarDinheiro,
  ) as [string, string, string];
  return (
    <div className="grid gap-5" data-testid="simulador-preco">
      <div className="grid gap-4 sm:grid-cols-2">
        <Segmentado
          rotulo={t.plano}
          valor={plano}
          aoMudar={setPlano}
          opcoes={(["basic", "pro"] as const).map((p) => ({ id: p, rotulo: t.planos[p] }))}
        />
        <ContadorNumero
          id="simulador-barbeiros"
          rotulo={t.barbeiros}
          ajuda={t.barbeirosAjuda}
          valor={s.profissionais}
          aoMudar={setBarbeiros}
          minimo={plano === "basic" ? 1 : 3}
          maximo={plano === "basic" ? 1 : 50}
          rotuloMenos={v.menos(t.barbeiros.toLowerCase())}
          rotuloMais={v.mais(t.barbeiros.toLowerCase())}
          desativado={plano === "basic"}
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
        <div className="rounded-xl border border-[rgba(var(--ac-rgb),.45)] bg-[rgba(var(--ac-rgb),.06)] p-3">
          <dt className="rotulo">{t.mensal}</dt>
          <dd
            className="numero text-2xl font-extrabold tabular-nums"
            data-testid="simulador-mensal"
          >
            {mensal}
          </dd>
        </div>
        <div className="rounded-xl border p-3">
          <dt className="rotulo">{t.anual}</dt>
          <dd className="numero text-2xl font-extrabold tabular-nums">{anual}</dd>
        </div>
      </dl>
      <div className="grid gap-2">
        <p className="rotulo">{t.decomposicao}</p>
        <ul className="grid gap-1 text-sm" data-testid="simulador-decomposicao">
          {linhas.map((l) => (
            <li key={l.tipo} className="flex justify-between gap-3">
              <span className="min-w-0 text-muted-foreground">
                {l.tipo === "base"
                  ? t.linhas.base(t.planos[plano], l.quantidade)
                  : t.linhas[l.tipo](l.quantidade)}
              </span>
              <span className="numero shrink-0 tabular-nums">{formatarDinheiro(l.valorCent)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-3 border-t pt-1 font-semibold">
            <span>{t.total}</span>
            <span className="numero tabular-nums">{mensal}</span>
          </li>
        </ul>
      </div>
      <p className="text-sm">
        {t.poupa(poupa)} {t.iva[regime]}
      </p>
      <AcoesTexto
        texto={t.texto(t.planos[plano], s.profissionais, mensal, anual, poupa, t.iva[regime])}
      />
    </div>
  );
}
