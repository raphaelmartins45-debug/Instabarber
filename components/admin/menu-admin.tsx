"use client";

import { usePathname } from "next/navigation";
import { MenuPainel } from "@/components/nucleo/menu-painel";
import { MENU_ADMIN, separadorAtual } from "@/lib/admin/menu";

/** Separadores do Admin, com o ativo tirado do endereço. */
export function MenuAdmin() {
  return <MenuPainel itens={MENU_ADMIN} atual={separadorAtual(usePathname())} />;
}
