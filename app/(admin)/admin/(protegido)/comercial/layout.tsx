import type { ReactNode } from "react";
import { NavComercial } from "@/components/admin/comercial/nav-comercial";
import { textos } from "@/lib/i18n/pt-PT";

// Comercial (Parte N): só no domínio principal e só para o super_admin com dois fatores, como
// todo o Admin (o layout do grupo protegido já o exige).

export default function LayoutComercial({ children }: { children: ReactNode }) {
  return (
    <section className="grid gap-5">
      <h1 className="text-[22px] font-extrabold tracking-tight">{textos.comercial.titulo}</h1>
      <NavComercial />
      {children}
    </section>
  );
}
