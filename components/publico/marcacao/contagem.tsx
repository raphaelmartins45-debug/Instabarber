"use client";

import { useEffect, useState } from "react";

/** Contagem decrescente da reserva (10 minutos), «mm:ss»; avisa quando chega a zero. */
export function Contagem({
  ate,
  texto,
  aoAcabar,
}: {
  ate: string;
  texto: (min: string) => string;
  aoAcabar: () => void;
}) {
  const resta = () => Math.max(0, new Date(ate).getTime() - Date.now());
  const [ms, setMs] = useState(resta);
  useEffect(() => {
    const id = setInterval(() => {
      const r = resta();
      setMs(r);
      if (r === 0) {
        clearInterval(id);
        aoAcabar();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a reserva não muda durante a contagem
  }, [ate]);
  const s = Math.ceil(ms / 1000);
  const mmss = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <p
      role="timer"
      aria-live="off"
      className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold"
      data-testid="contagem"
    >
      {texto(mmss)}
    </p>
  );
}
