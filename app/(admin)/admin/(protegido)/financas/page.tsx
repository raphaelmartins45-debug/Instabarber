import { redirect } from "next/navigation";

/** A entrada das Finanças abre no primeiro separador. */
export default function Financas() {
  redirect("/admin/financas/custos");
}
