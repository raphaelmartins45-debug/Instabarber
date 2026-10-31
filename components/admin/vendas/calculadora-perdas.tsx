"use client";

import { useState } from "react";
import { Campo } from "@/components/nucleo/campo";
import { ContadorNumero } from "@/components/nucleo/contador-numero";
import { Segmentado } from "@/components/nucleo/segmentado";
import { centimosDeTexto, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Plano, RegimeIva } from "@/lib/regras/mensalidade";
import { contaPerdas, simularPreco } from "@/lib/regras/vendas";
import { AcoesTexto } from "./acoes-texto";

const t = textos.vendas.perdas;
const v = textos.vendas;
const planos = textos.vendas.simulador.planos;

/** Um número grande com o rótulo por cima e a explicação por baixo. */
function Bloco({
  rotulo,
  valor,
  ajuda,
  id,
}: {
  rotulo: string;
  valor: string;
  ajuda: string;
  id: string;
}) {
  return (
    <div className="grid content-start gap-1 rounded-xl border p-3" data-testid={`perdas-${id}`}>
      <span className="rotulo">{rotulo}</span>
      <span className="numero text-2xl font-extrabold break-words tabular-nums">{valor}</span>
      <span className="text-xs text-muted-foreground">{ajuda}</span>
    </div>
  );
}

/** «Quanto está a perder» (D-181): a conta da visita, com os números do barbeiro. */
export function CalculadoraPerdas({ regime }: { regime: RegimeIva }) {
  const [faltas, setFaltas] = useState(0);
  const [visita, setVisita] = useState("");
  const [perdidos, setPerdidos] = useState(0);
  const [plano, setPlano] = useState<Plano>("basic");
  const mensalCent = simularPreco(plano, 0, false, regime).mensalCent;
  const visitaCent = centimosDeTexto(visita) ?? 0;
  const c = contaPerdas({
    faltasSemana: faltas,
    valorVisitaCent: visitaCent,
    clientesPerdidos: perdidos,
    mensalidadeCent: mensalCent,
  });
  const pronto = visitaCent > 0;
  const traco = "—";
  const linhas = pronto
    ? [
        ...(c.faltasMesCent > 0 ? [t.faltasMes(formatarDinheiro(c.faltasMesCent))] : []),
        ...(c.recuperavelCent > 0 ? [t.recuperavel(formatarDinheiro(c.recuperavelCent))] : []),
        t.cortes(c.cortesParaPagar, formatarDinheiro(mensalCent)),
      ]
    : [];
  return (
    <div className="grid gap-5" data-testid="calculadora-perdas">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="perdas-visita"
          rotulo={t.visita}
          inputMode="decimal"
          placeholder="15"
          value={visita}
          onChange={(e) => setVisita(e.target.value)}
        />
        <Segmentado
          rotulo={t.plano}
          valor={plano}
          aoMudar={setPlano}
          opcoes={(["basic", "pro"] as const).map((p) => ({ id: p, rotulo: planos[p] }))}
        />
        <ContadorNumero
          id="perdas-faltas"
          rotulo={t.faltas}
          valor={faltas}
          aoMudar={setFaltas}
          minimo={0}
          maximo={200}
          rotuloMenos={v.menos(t.faltas.toLowerCase())}
          rotuloMais={v.mais(t.faltas.toLowerCase())}
        />
        <ContadorNumero
          id="perdas-perdidos"
          rotulo={t.perdidos}
          ajuda={t.perdidosAjuda}
          valor={perdidos}
          aoMudar={setPerdidos}
          minimo={0}
          maximo={5000}
          passo={5}
          rotuloMenos={v.menos(t.perdidos.toLowerCase())}
          rotuloMais={v.mais(t.perdidos.toLowerCase())}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <Bloco
          id="faltas"
          rotulo={t.blocos.faltas}
          valor={pronto ? formatarDinheiro(c.faltasMesCent) : traco}
          ajuda={t.blocosAjuda.faltas}
        />
        <Bloco
          id="recuperavel"
          rotulo={t.blocos.recuperavel}
          valor={pronto ? formatarDinheiro(c.recuperavelCent) : traco}
          ajuda={t.blocosAjuda.recuperavel}
        />
        <Bloco
          id="cortes"
          rotulo={t.blocos.cortes}
          valor={pronto ? String(c.cortesParaPagar) : traco}
          ajuda={t.blocosAjuda.cortes(formatarDinheiro(mensalCent))}
        />
      </div>
      {pronto ? (
        <AcoesTexto texto={t.texto(linhas)} />
      ) : (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      )}
    </div>
  );
}
