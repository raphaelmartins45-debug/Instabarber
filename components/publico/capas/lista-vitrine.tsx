"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A parte viva da Vitrine (D-198): a lista dos serviços ao lado do expositor. Escolher um mostra
 * o preço e a duração e leva o botão a marcar esse serviço. Só recebe dados simples.
 */
export function ListaVitrine({
  servicos,
  marcar,
  rotuloLista,
  rotuloMarcar,
  destaque,
  tintaDestaque,
  expositor,
}: {
  servicos: { id: string; nome: string; preco: string; duracao: string }[];
  marcar: string | null;
  rotuloLista: string;
  rotuloMarcar: string;
  destaque: string;
  tintaDestaque: string;
  expositor: React.ReactNode;
}) {
  const [i, setI] = useState(0);
  const s = servicos[i];
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_400px_1fr] md:items-center md:gap-10">
      <ul
        aria-label={rotuloLista}
        className="order-2 flex gap-5 overflow-x-auto pb-2 md:order-1 md:grid md:justify-items-end md:gap-2 md:overflow-visible"
      >
        {servicos.slice(0, 7).map((x, n) => (
          <li key={x.id} className="shrink-0">
            <button
              type="button"
              onClick={() => setI(n)}
              aria-pressed={n === i}
              className={cn(
                "min-h-11 transition-opacity",
                n === i ? "text-xl font-semibold" : "text-base opacity-50 hover:opacity-80",
              )}
            >
              {x.nome}
            </button>
          </li>
        ))}
      </ul>
      <div className="order-1 aspect-[4/5] w-full overflow-hidden md:order-2">{expositor}</div>
      <div className="order-3 grid gap-4">
        {s ? (
          <p className="grid gap-1" data-testid="vitrine-servico">
            <span className="titulo-estilo text-4xl">{s.preco}</span>
            <span className="text-sm opacity-75">{s.duracao}</span>
          </p>
        ) : null}
        {marcar && s ? (
          <Link
            href={`${marcar}?servico=${s.id}`}
            className="flex h-16 items-center justify-between gap-4 px-6 text-lg font-semibold transition-[filter] hover:brightness-110"
            style={{ backgroundColor: destaque, color: tintaDestaque }}
          >
            {rotuloMarcar}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
