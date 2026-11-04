import type { ReactNode } from "react";
import type { Modelo } from "@/lib/publico/estilos";

/**
 * A organização do corpo da página pública (D-200). `principal` são os serviços, a equipa, a
 * história e a loja; `visita` são onde estamos, o horário e os contactos.
 * - coluna: tudo numa coluna, com a visita em três cartões lado a lado no computador;
 * - lateral: a visita numa coluna à direita, que acompanha a página;
 * - editorial: os títulos à esquerda e o conteúdo à direita, como num índice;
 * - bento: cada bloco num mosaico de tamanhos diferentes (D-204).
 */
export function Corpo({
  corpo,
  principal,
  visita,
}: {
  corpo: Modelo["corpo"];
  principal: ReactNode;
  visita: ReactNode;
}) {
  if (corpo === "lateral")
    return (
      <main
        data-corpo={corpo}
        className="mx-auto grid max-w-6xl gap-x-12 px-4 pt-4 md:grid-cols-[minmax(0,1fr)_20rem] md:px-8"
      >
        <div className="min-w-0">{principal}</div>
        <aside
          data-lateral
          className="grid content-start gap-8 py-8 md:sticky md:top-16 md:self-start md:py-10"
        >
          {visita}
        </aside>
      </main>
    );
  // Bento (D-204): cada bloco é um mosaico; os tamanhos vêm do globals.css, por secção.
  if (corpo === "bento")
    return (
      <main
        data-corpo={corpo}
        className="mx-auto grid max-w-6xl gap-4 px-4 pt-8 md:grid-cols-6 md:px-8 md:[grid-auto-flow:dense]"
      >
        {principal}
        {visita}
      </main>
    );
  return (
    <main data-corpo={corpo} className="mx-auto max-w-6xl px-4 pt-4 md:px-8">
      {principal}
      {corpo === "coluna" ? (
        <div className="grid items-start gap-x-6 md:grid-cols-3">{visita}</div>
      ) : (
        visita
      )}
    </main>
  );
}
