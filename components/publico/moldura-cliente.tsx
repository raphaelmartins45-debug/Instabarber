import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Moldura das páginas do cliente (I.3, camada 4): largura máxima de 460 px, botão de voltar
 * sempre presente e a cor da marca na barra de cima.
 */
export function MolduraCliente({
  titulo,
  voltar,
  rotuloVoltar,
  cor,
  corTexto,
  direita,
  children,
}: {
  titulo: string;
  voltar: string;
  rotuloVoltar: string;
  cor: string;
  corTexto: string;
  direita?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header style={{ backgroundColor: cor, color: corTexto }}>
        <div className="mx-auto flex max-w-[460px] items-center gap-3 px-4 py-3">
          <Link
            href={voltar}
            aria-label={rotuloVoltar}
            className="grid size-11 place-items-center rounded-full border border-current/30 text-lg"
          >
            ←
          </Link>
          <span className="flex-1 truncate font-bold">{titulo}</span>
          {direita}
        </div>
      </header>
      <main className="mx-auto grid max-w-[460px] gap-4 px-4 py-6">{children}</main>
    </div>
  );
}
