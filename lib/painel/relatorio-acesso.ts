import "server-only";
import { ultimosMeses } from "@/lib/formatacao/datas";

// O relatório abre com o mês corrente e só mostra os últimos doze meses (E.5).
export const MESES_RELATORIO = 12;

export function mesesDoRelatorio(): string[] {
  return ultimosMeses(MESES_RELATORIO);
}

export function lerMesRelatorio(pedido: string | null | undefined): string {
  const meses = mesesDoRelatorio();
  return pedido && meses.includes(pedido) ? pedido : meses[0]!;
}
