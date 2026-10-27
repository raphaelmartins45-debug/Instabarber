"use client";

import { useState } from "react";
import { Campo } from "@/components/nucleo/campo";
import { Selecao } from "@/components/nucleo/selecao";
import { centimosDeTexto, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Plano, RegimeIva } from "@/lib/regras/mensalidade";
import { contaPerdas, simularPreco } from "@/lib/regras/vendas";
import { AcoesTexto } from "./acoes-texto";

const t = textos.vendas.perdas;
const planos = textos.vendas.simulador.planos;

/** «Quanto está a perder» (D-181): a conta da visita, com os números do barbeiro. */
export function CalculadoraPerdas({ regime }: { regime: RegimeIva }) {
  const [faltas, setFaltas] = useState("");
  const [visita, setVisita] = useState("");
  const [perdidos, setPerdidos] = useState("");
  const [plano, setPlano] = useState<Plano>("basic");
  const mensalCent = simularPreco(plano, 0, false, regime).mensalCent;
  const visitaCent = centimosDeTexto(visita) ?? 0;
  const c = contaPerdas({
    faltasSemana: Number(faltas) || 0,
    valorVisitaCent: visitaCent,
    clientesPerdidos: Number(perdidos) || 0,
    mensalidadeCent: mensalCent,
  });
  const linhas =
    visitaCent > 0
      ? [
          ...(c.faltasMesCent > 0 ? [t.faltasMes(formatarDinheiro(c.faltasMesCent))] : []),
          ...(c.recuperavelCent > 0 ? [t.recuperavel(formatarDinheiro(c.recuperavelCent))] : []),
          t.cortes(c.cortesParaPagar, formatarDinheiro(mensalCent)),
        ]
      : [];
  return (
    <div className="grid gap-4" data-testid="calculadora-perdas">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo
          id="perdas-faltas"
          rotulo={t.faltas}
          type="number"
          inputMode="numeric"
          min={0}
          value={faltas}
          onChange={(e) => setFaltas(e.target.value)}
        />
        <Campo
          id="perdas-visita"
          rotulo={t.visita}
          inputMode="decimal"
          value={visita}
          onChange={(e) => setVisita(e.target.value)}
        />
        <Campo
          id="perdas-perdidos"
          rotulo={t.perdidos}
          ajuda={t.perdidosAjuda}
          type="number"
          inputMode="numeric"
          min={0}
          value={perdidos}
          onChange={(e) => setPerdidos(e.target.value)}
        />
        <Selecao
          id="perdas-plano"
          rotulo={t.plano}
          valor={plano}
          aoMudar={(v) => setPlano(v as Plano)}
          opcoes={(["basic", "pro"] as const).map((p) => ({ id: p, rotulo: planos[p] }))}
        />
      </div>
      {linhas.length ? (
        <>
          <ul className="grid gap-1 text-sm font-semibold" data-testid="perdas-resultado">
            {linhas.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <AcoesTexto texto={t.texto(linhas)} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      )}
    </div>
  );
}
