import { textos } from "@/lib/i18n/pt-PT";

const ERROS: Record<string, string> = textos.adesao.erros;

/** Texto do erro de um campo a partir do código da validação (lib/validacao/adesao.ts). */
export function textoErro(codigo: string | undefined): string | undefined {
  if (!codigo) return undefined;
  return ERROS[codigo] ?? ERROS.invalido;
}
