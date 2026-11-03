"use client";

import { useEffect, useRef, useState } from "react";
import { textos } from "@/lib/i18n/pt-PT";
import { ESTILOS, type Estilo } from "@/lib/publico/estilos";
import { cn } from "@/lib/utils";
import { MiniaturaModelo } from "./miniatura-modelo";

const t = textos.sistema.marca;

// O ecrã de computador em que a página é desenhada no quadro, antes de ser reduzida: a capa
// ocupa um ecrã, como num computador, e o resto percorre-se por dentro do quadro.
const LARGURA = 1280;
const ALTURA = 800;

/**
 * O modelo da página pública (D-198, D-199): à esquerda, uma miniatura por modelo com a estrutura
 * dele, na cor da barbearia; à direita, a página verdadeira da barbearia com o modelo e a cor
 * escolhidos (ainda por guardar), reduzida como se fosse vista num computador. No telemóvel, o
 * quadro vem por baixo das opções.
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
  return (
    <fieldset className="grid gap-4" data-testid="pre-visualizacao">
      <legend className="text-mini font-semibold tracking-wide text-muted-foreground uppercase">
        {t.estilo}
      </legend>
      <p className="text-sm text-muted-foreground">{t.estiloAjuda}</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="grid grid-cols-2 gap-3">
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
              <MiniaturaModelo estilo={e} cor={cor} nome={nome} />
              <span className="px-1 text-sm font-semibold">{t.estilos[e]}</span>
            </label>
          ))}
        </div>
        <QuadroPagina modelo={valor} cor={cor} />
      </div>
    </fieldset>
  );
}

/** A página verdadeira num quadro reduzido, que se percorre por dentro. */
function QuadroPagina({ modelo, cor }: { modelo: Estilo; cor: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.4);
  const [src, setSrc] = useState(() => endereco(modelo, cor));
  const atual = useRef(src);
  const [aCarregar, setACarregar] = useState(true);
  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / LARGURA);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  // Meio segundo depois da última mudança, para o seletor de cor não recarregar a cada passo.
  useEffect(() => {
    const espera = setTimeout(() => {
      const novo = endereco(modelo, cor);
      if (novo === atual.current) return;
      atual.current = novo;
      setACarregar(true);
      setSrc(novo);
    }, 500);
    return () => clearTimeout(espera);
  }, [modelo, cor]);
  return (
    <div className="grid gap-2 lg:sticky lg:top-4">
      <p className="text-sm font-semibold">
        {t.preVisualizacao}
        {aCarregar ? (
          <span className="font-normal text-muted-foreground"> · {t.aCarregar}</span>
        ) : null}
      </p>
      <div
        ref={caixa}
        className="overflow-hidden rounded-lg border bg-muted"
        style={{ height: ALTURA * escala }}
      >
        <iframe
          src={src}
          title={t.preVisualizacao}
          onLoad={() => setACarregar(false)}
          className="origin-top-left border-0"
          style={{ width: LARGURA, height: ALTURA, transform: `scale(${escala})` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t.preVisualizacaoAjuda}</p>
    </div>
  );
}

const endereco = (modelo: Estilo, cor: string) =>
  `/app/pre-visualizacao?modelo=${modelo}&cor=${encodeURIComponent(cor)}`;
