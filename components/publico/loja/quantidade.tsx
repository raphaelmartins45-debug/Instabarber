"use client";

import { Minus, Plus } from "lucide-react";

/** Botões de menos e mais com a quantidade ao meio, com alvos de 44 px (I.3.1). */
export function Quantidade({
  valor,
  menos,
  mais,
  nome,
  mudar,
}: {
  valor: number;
  menos: string;
  mais: string;
  nome: string;
  mudar: (q: number) => void;
}) {
  const botao = "grid size-11 place-items-center rounded-full border disabled:opacity-40";
  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        className={botao}
        aria-label={`${menos}: ${nome}`}
        disabled={valor === 0}
        onClick={() => mudar(valor - 1)}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">
        {valor}
      </span>
      <button
        type="button"
        className={botao}
        aria-label={`${mais}: ${nome}`}
        disabled={valor >= 20}
        onClick={() => mudar(valor + 1)}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </span>
  );
}
