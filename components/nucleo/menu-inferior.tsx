"use client";

import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type ItemMontado, planificar } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";
import { EntradaInferior } from "./entrada-inferior";
import { FolhaMais } from "./folha-mais";

const VISIVEIS = 5;
/** Quanto é preciso descer ou subir (px) para a barra se esconder ou voltar. */
const LIMIAR = 12;

/**
 * Navegação inferior abaixo de 768 px (I.3.1): ícone e rótulo curto, no máximo cinco entradas; o
 * resto na folha «Mais». A barra esconde-se ao descer a página e volta ao subir; a folha fecha ao
 * mudar de página, ao tocar no fundo e com Esc, e o fundo não desliza enquanto está aberta (D-183).
 */
export function MenuInferior({ itens: menu, atual }: { itens: ItemMontado[]; atual: string }) {
  const [aberto, setAberto] = useState(false);
  const [oculta, setOculta] = useState(false);
  const ultimoY = useRef(0);
  const caminho = usePathname();
  // As pastas (ex.: «Gestão do negócio») vão sempre para o «Mais», com o título e as entradas
  // de dentro por baixo; as entradas soltas enchem a barra.
  const simples = menu.filter((i) => !i.filhos);
  const pastas = menu.filter((i) => i.filhos);
  const cabem = !pastas.length && simples.length <= VISIVEIS;
  const fixos = cabem ? simples : simples.slice(0, VISIVEIS - 1);
  const resto = cabem ? [] : simples.slice(VISIVEIS - 1);
  const restoAtivo = [...resto, ...planificar(pastas)].some((i) => i.id === atual);

  useEffect(() => {
    setAberto(false);
    setOculta(false);
  }, [caminho]);

  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = "hidden";
    window.addEventListener("keydown", tecla);
    return () => {
      raiz.style.overflow = antes;
      window.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  useEffect(() => {
    let pedido = 0;
    const aoDeslizar = () => {
      cancelAnimationFrame(pedido);
      pedido = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - ultimoY.current;
        if (Math.abs(delta) < LIMIAR) return;
        setOculta(delta > 0 && y > 64);
        ultimoY.current = y;
      });
    };
    window.addEventListener("scroll", aoDeslizar, { passive: true });
    return () => {
      cancelAnimationFrame(pedido);
      window.removeEventListener("scroll", aoDeslizar);
    };
  }, []);

  return (
    <>
      {aberto ? (
        <>
          <div
            aria-hidden
            data-testid="mais-fundo"
            onClick={() => setAberto(false)}
            className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 starting:opacity-0 md:hidden"
          />
          <FolhaMais
            resto={resto}
            pastas={pastas}
            atual={atual}
            aoFechar={() => setAberto(false)}
          />
        </>
      ) : null}
      <nav
        aria-label={textos.paineis.menuRotulo}
        data-oculta={oculta && !aberto ? "" : undefined}
        className={cn(
          "barra fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-sistema md:hidden",
          oculta && !aberto && "translate-y-full",
        )}
      >
        <ul className="flex">
          {fixos.map((item) => (
            <li key={item.id} className="flex-1" data-menu={item.id}>
              <EntradaInferior item={item} atual={atual} />
            </li>
          ))}
          {!cabem ? (
            <li className="flex-1">
              <button
                type="button"
                aria-expanded={aberto}
                aria-controls="menu-mais"
                onClick={() => setAberto((a) => !a)}
                className={cn(
                  "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-mini transition-colors duration-150",
                  restoAtivo || aberto ? "font-semibold text-foreground" : "text-terciario",
                )}
              >
                <Ellipsis aria-hidden className="size-5" />
                {textos.comum.mais}
              </button>
            </li>
          ) : null}
        </ul>
      </nav>
    </>
  );
}
