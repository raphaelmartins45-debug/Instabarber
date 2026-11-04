"use client";

import { Minus, Plus } from "lucide-react";

/** Botões de menos e mais com a quantidade ao meio, com alvos de 44 px (I.3.1). */
export function Quantidade({
  valor,
  menos,
  mais,
  nome,
  mudar,
  cheio = false,
}: {
  valor: number;
  menos: string;
  mais: string;
  nome: string;
  mudar: (q: number) => void;
  /** Ocupa a largura toda, em cápsula (montra da loja, D-205). */
  cheio?: boolean;
}) {
  const botao = cheio
    ? "grid size-11 place-items-center rounded-full disabled:opacity-40"
    : "grid size-11 place-items-center rounded-full border disabled:opacity-40";
  return (
    <span
      className={
        cheio
          ? "flex items-center justify-between rounded-[var(--raio-botao)] bg-muted"
          : "flex items-center gap-2"
      }
    >
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
