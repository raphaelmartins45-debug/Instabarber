import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Moldura das páginas do cliente (I.3, camada 4): no telemóvel, largura máxima de 460 px; no
 * computador, a página alarga (larga: marcação, loja e área de cliente; D-129). Botão de voltar
 * sempre presente e a cor da marca na barra de cima.
 */
export function MolduraCliente({
  titulo,
  voltar,
  rotuloVoltar,
  cor,
  corTexto,
  direita,
  larga = false,
  children,
}: {
  titulo: string;
  voltar: string;
  rotuloVoltar: string;
  cor: string;
  corTexto: string;
  direita?: ReactNode;
  /** No computador, a largura de uma página (com colunas) em vez da de um cartão. */
  larga?: boolean;
  children: ReactNode;
}) {
  const largura = larga ? "max-w-[460px] md:max-w-5xl" : "max-w-[460px] md:max-w-xl";
  return (
    <div className="min-h-dvh">
      <header style={{ backgroundColor: cor, color: corTexto }}>
        <div className={`mx-auto flex ${largura} items-center gap-3 px-4 py-3`}>
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
      <main className={`mx-auto grid ${largura} gap-4 px-4 py-6 md:py-10`}>{children}</main>
    </div>
  );
}
