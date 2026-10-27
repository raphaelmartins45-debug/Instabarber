import { regiao } from "./regiao";

// Telefones guardam-se em E.164 (+351912345678). A máscara portuguesa de nove dígitos acrescenta o
// indicativo; números de outros países escrevem-se com o indicativo, a começar por «+» ou «00»
// (clientes estrangeiros, D-178). A base de dados confere o formato E.164 outra vez.

const PORTUGUES = new RegExp(`^(?:\\+?${regiao.indicativo})?([239]\\d{8})$`);
const INTERNACIONAL = /^\+([1-9]\d{7,14})$/;

/**
 * Aceita "912 345 678", "+351 912-345-678", "+44 7911 123456", "0033 6 12 34 56 78"… e devolve
 * E.164; null se não for um número válido. Com o indicativo português, só os nove dígitos certos.
 */
export function telefoneE164(texto: string): string | null {
  const limpo = texto.replace(/[\s.()-]/g, "").replace(/^00/, "+");
  const nacional = PORTUGUES.exec(limpo);
  if (nacional) return `+${regiao.indicativo}${nacional[1]}`;
  const internacional = INTERNACIONAL.exec(limpo);
  if (!internacional || internacional[1]!.startsWith(regiao.indicativo)) return null;
  return `+${internacional[1]}`;
}

/** "+351912345678" → "912 345 678" para mostrar (outros indicativos ficam como estão). */
export function formatarTelefone(e164: string): string {
  const nacional = e164.startsWith(`+${regiao.indicativo}`)
    ? e164.slice(regiao.indicativo.length + 1)
    : null;
  return nacional && nacional.length === 9
    ? nacional.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")
    : e164;
}
