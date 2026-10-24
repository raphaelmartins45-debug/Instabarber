import type { ReactNode } from "react";
import { NavFinancas } from "@/components/admin/financas/nav-financas";
import { textos } from "@/lib/i18n/pt-PT";

// Finanças da Performa LAB (Parte O): só no domínio principal e só para o super_admin com dois
// fatores, como todo o Admin (o layout do grupo protegido já o exige).

export default function LayoutFinancas({ children }: { children: ReactNode }) {
  return (
    <section className="grid gap-5">
      <h1 className="text-[22px] font-extrabold tracking-tight">{textos.financas.titulo}</h1>
      <NavFinancas />
      {children}
    </section>
  );
}
