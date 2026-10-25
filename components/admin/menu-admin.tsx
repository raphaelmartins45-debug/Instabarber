"use client";

import { usePathname } from "next/navigation";
import { MenuPainel } from "@/components/nucleo/menu-painel";
import type { PapelPlataforma } from "@/lib/admin/acesso";
import { menuDoPapel, separadorAtual } from "@/lib/admin/menu";

/** Separadores do Admin do papel de quem entrou (D-161), com o ativo tirado do endereço. */
export function MenuAdmin({ papel }: { papel: PapelPlataforma }) {
  const menu = menuDoPapel(papel);
  return <MenuPainel itens={menu} atual={separadorAtual(usePathname(), menu)} />;
}
