import "server-only";
import { variavelOpcional } from "@/lib/configuracao/ambiente";
import { escolherTelefoneApoio, type TelefoneApoio } from "./telefone";

/** O telefone do apoio a partir da configuração (D-197). */
export function telefoneApoio(): TelefoneApoio | null {
  return escolherTelefoneApoio(
    variavelOpcional("TELEFONE_APOIO_TXT"),
    variavelOpcional("TELEFONE_COMERCIAL_TXT"),
    variavelOpcional("TELEFONE_COMERCIAL"),
  );
}
