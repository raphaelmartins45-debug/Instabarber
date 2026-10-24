import Link from "next/link";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";
import { IconeMenu } from "./icone-menu";

/** Uma entrada da barra lateral: ligação, ou desativada com a etiqueta Pro (D.2). */
export function EntradaLateral({
  item,
  ativo,
  recolhido,
  dentro,
}: {
  item: ItemMontado;
  ativo: boolean;
  recolhido: boolean;
  /** Dentro de uma pasta: recuada, sem a barra do ativo à esquerda. */
  dentro?: boolean;
}) {
  const base = cn(
    "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-200 ease-sistema",
    recolhido && "justify-center px-0",
    dentro && !recolhido && "pl-9",
  );
  const rotulo = recolhido ? (
    <span className="sr-only">{item.rotulo}</span>
  ) : (
    <span className="truncate">{item.rotulo}</span>
  );
  if (item.estado === "upgrade") {
    return (
      <span
        aria-disabled="true"
        title={textos.paineis.upgrade}
        className={cn(base, "text-terciario")}
      >
        <IconeMenu id={item.id} className="size-[18px] shrink-0" />
        {rotulo}
        {recolhido ? null : (
          <span className="ml-auto rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-ligacao">
            {textos.paineis.etiquetaPro}
          </span>
        )}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      title={recolhido ? item.rotulo : undefined}
      className={cn(
        base,
        ativo
          ? "bg-accent font-semibold text-foreground"
          : "text-muted-foreground hover:bg-foreground/[.05] hover:text-foreground",
        ativo &&
          !dentro &&
          "before:absolute before:inset-y-2 before:-left-3 before:w-0.5 before:rounded-full before:bg-primary",
      )}
    >
      <IconeMenu id={item.id} className={cn("size-[18px] shrink-0", ativo && "text-ligacao")} />
      {rotulo}
    </Link>
  );
}
