import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/equipa/contexto";

/** Gestão do sistema (E.2): abre na primeira secção. */
export default async function GestaoSistema() {
  await exigirGestor();
  redirect("/app/sistema/estado");
}
