import { redirect } from "next/navigation";

// A demonstração passou para o separador «Demo» do Comercial (D-207).
export default function Demonstracao() {
  redirect("/admin/comercial/demo");
}
