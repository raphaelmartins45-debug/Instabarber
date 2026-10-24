import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Rascunhos base dos modelos (N.8): a fonte única é docs/comercial/ (revistos pelo jurista).
// O ecrã Modelos importa-os como versão nova em rascunho; só o dono os aprova (D-148).

const FICHEIROS = {
  contrato: "modelo-contrato.md",
  condicoes_proposta: "modelo-condicoes-proposta.md",
} as const;

export async function lerModeloBase(
  tipo: keyof typeof FICHEIROS,
): Promise<{ titulo: string; corpo: string }> {
  const corpo = await readFile(
    path.join(process.cwd(), "docs", "comercial", FICHEIROS[tipo]),
    "utf8",
  );
  const titulo = /^#\s+(.+)$/m.exec(corpo)?.[1]?.trim() ?? tipo;
  return { titulo, corpo };
}
