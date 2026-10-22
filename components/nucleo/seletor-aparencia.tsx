"use client";

import { Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  APARENCIA_OMISSAO,
  type Aparencia,
  aplicarAparencia,
  CHAVE_APARENCIA,
  DESTAQUES,
  lerAparencia,
  MODOS,
} from "@/lib/design/aparencia";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

const t = textos.paineis.aparencia;

/** «Aparência»: modo (escuro, claro, sistema) e cor de destaque, guardados no dispositivo. */
export function SeletorAparencia() {
  const [aberto, setAberto] = useState(false);
  const [atual, setAtual] = useState<Aparencia>(APARENCIA_OMISSAO);
  const [comMarca, setComMarca] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let guardado: string | null = null;
    try {
      guardado = localStorage.getItem(CHAVE_APARENCIA);
    } catch {
      // Sem armazenamento: fica o omisso.
    }
    setAtual(lerAparencia(guardado));
    const marca = getComputedStyle(document.documentElement).getPropertyValue("--marca-escuro");
    setComMarca(marca.trim() !== "");
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const escolher = (a: Aparencia) => {
    setAtual(a);
    aplicarAparencia(a);
  };
  const destaques = DESTAQUES.filter((d) => d !== "marca" || comMarca);

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        aria-expanded={aberto}
        aria-label={t.titulo}
        title={t.titulo}
        onClick={() => setAberto((a) => !a)}
        className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 ease-sistema hover:bg-foreground/[.06] hover:text-foreground"
      >
        <Palette aria-hidden className="size-[18px]" />
      </button>
      {aberto ? (
        <div
          data-testid="seletor-aparencia"
          className="vidro animate-entrada absolute right-0 top-12 z-50 grid w-64 gap-4 rounded-2xl p-4 shadow-flutuante"
        >
          <p className="text-sm font-semibold">{t.titulo}</p>
          <Grupo
            rotulo={t.modo}
            opcoes={MODOS.map((m) => ({ id: m, rotulo: t.modos[m] }))}
            valor={atual.modo}
            onEscolher={(modo) => escolher({ ...atual, modo: modo as Aparencia["modo"] })}
          />
          <Grupo
            rotulo={t.destaque}
            opcoes={destaques.map((d) => ({ id: d, rotulo: t.destaques[d] }))}
            valor={atual.destaque}
            onEscolher={(d) => escolher({ ...atual, destaque: d as Aparencia["destaque"] })}
          />
          <p className="text-xs text-terciario">{t.ajuda}</p>
        </div>
      ) : null}
    </div>
  );
}

function Grupo({
  rotulo,
  opcoes,
  valor,
  onEscolher,
}: {
  rotulo: string;
  opcoes: { id: string; rotulo: string }[];
  valor: string;
  onEscolher: (id: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="rotulo">{rotulo}</p>
      <div role="radiogroup" aria-label={rotulo} className="flex flex-wrap gap-1.5">
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={o.id === valor}
            onClick={() => onEscolher(o.id)}
            className={cn(
              "h-9 rounded-lg border px-3 text-sm transition-colors duration-200 ease-sistema",
              o.id === valor
                ? "border-primary bg-accent font-semibold text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}
