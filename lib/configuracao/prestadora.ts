import "server-only";
import type { Prestadora } from "@/lib/i18n/pt-PT/legal/tipos";
import { variavel } from "./ambiente";

/** Identificação da Prestadora para os documentos legais (D-44). Nunca escrita no código. */
export function lerPrestadora(): Prestadora {
  return {
    nome: variavel("PRESTADORA_NOME"),
    nif: variavel("PRESTADORA_NIF"),
    morada: variavel("PRESTADORA_MORADA"),
  };
}
