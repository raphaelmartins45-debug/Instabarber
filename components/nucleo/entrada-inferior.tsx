import Link from "next/link";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";
import { IconeMenu } from "./icone-menu";

/** Uma entrada da navegação de baixo: na barra (ícone por cima) ou na folha «Mais» (ao lado). */
export function EntradaInferior({
  item,
  atual,
  horizontal,
}: {
  item: ItemMontado;
  atual: string;
  horizontal?: boolean;
}) {
  const classe = horizontal
    ? "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm"
    : "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center text-mini leading-tight";
  if (item.estado === "upgrade") {
    return (
      <span
        aria-disabled="true"
        title={textos.paineis.upgrade}
        className={cn(classe, "text-terciario/60")}
      >
        <IconeMenu id={item.id} className="size-5" />
        {item.rotulo}
      </span>
    );
  }
  const ativo = item.id === atual;
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        classe,
        "transition-colors duration-150",
        ativo ? "font-semibold text-foreground" : "text-terciario hover:text-foreground",
        horizontal && ativo && "bg-accent",
      )}
    >
      <IconeMenu id={item.id} className={cn("size-5", ativo && "text-ligacao")} />
      {item.rotulo}
    </Link>
  );
}
