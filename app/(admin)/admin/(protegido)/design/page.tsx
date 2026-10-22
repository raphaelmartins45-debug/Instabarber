import type { Metadata } from "next";
import { BlocoBase } from "@/components/admin/design/bloco-base";
import { BlocoDados } from "@/components/admin/design/bloco-dados";
import { BlocoEstados } from "@/components/admin/design/bloco-estados";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.design;

export const metadata: Metadata = { title: t.titulo };

// Catálogo interno do sistema de design (D-134): só o super_admin, como todo o Admin.

export default function CatalogoDesign() {
  return (
    <>
      <div className="grid gap-1">
        <h1 className="text-[22px] font-extrabold tracking-tight">{t.titulo}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t.texto}</p>
      </div>
      <BlocoBase />
      <BlocoDados />
      <BlocoEstados />
    </>
  );
}
