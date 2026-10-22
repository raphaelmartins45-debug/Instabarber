import type { ReactNode } from "react";

/** Secção de uma ficha: título de 15 px e conteúdo (I.2). */
export function Secao({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3" aria-labelledby={id}>
      <h2 id={id} className="text-[15px] font-bold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
