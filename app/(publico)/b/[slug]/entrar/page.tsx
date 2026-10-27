import { redirect } from "next/navigation";
import { lerEndereco } from "@/lib/inquilino/endereco";

/** Ligações antigas: a entrada do cliente passou para /cliente (D-180). */
export default async function EntrarAntigo() {
  const { base } = await lerEndereco();
  redirect(`${base}/cliente`);
}
