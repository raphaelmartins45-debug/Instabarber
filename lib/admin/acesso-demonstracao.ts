import "server-only";
import { cookies } from "next/headers";
import { codigoDemonstracaoValido } from "@/lib/repositorios/admin/demonstracao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// O acesso a instabarber.pt/demo (D-208): quem escreveu o código da reunião fica com ele num
// cookie só do servidor. Em cada pedido o código volta a ser conferido na base de dados, por isso
// o «Reset» (ou um código novo) fecha a porta logo.

export const COOKIE_DEMO = "ib_demo";

/** Verdadeiro se este navegador tem um código válido para a demonstração atual. */
export async function temAcessoDemonstracao(): Promise<boolean> {
  const codigo = (await cookies()).get(COOKIE_DEMO)?.value;
  if (!codigo || !/^\d{6}$/.test(codigo)) return false;
  return codigoDemonstracaoValido(await criarClienteServidor(), codigo);
}
