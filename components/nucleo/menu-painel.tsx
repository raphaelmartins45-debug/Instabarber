import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { MenuInferior } from "./menu-inferior";
import { MenuLateral } from "./menu-lateral";

/**
 * Menu montado a partir das funcionalidades ativas (D.3): barra lateral no computador e
 * navegação inferior no telemóvel. As entradas «upgrade» ficam desativadas com a chamada do Pro.
 */
export function MenuPainel({ itens, atual }: { itens: ItemMontado[]; atual: string }) {
  return (
    <>
      <MenuInferior itens={itens} atual={atual} />
      <MenuLateral itens={itens} atual={atual} />
    </>
  );
}
