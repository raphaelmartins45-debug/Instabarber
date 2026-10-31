import type { ReactNode } from "react";
import { NavVendas } from "@/components/admin/vendas/nav-vendas";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.vendas;

/** Apoio às vendas (D-181): a equipa InstaBarber com dois fatores; um módulo por separador. */
export default async function LayoutVendas({ children }: { children: ReactNode }) {
  await exigirEquipaPlataforma();
  return (
    <section className="grid gap-5">
      <header className="grid gap-1">
        <h1 className="text-titulo font-extrabold tracking-tight">{t.titulo}</h1>
        <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      </header>
      <NavVendas />
      {children}
    </section>
  );
}
