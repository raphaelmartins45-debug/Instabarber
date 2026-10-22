import { regiao } from "./regiao";

// Telefones guardam-se em E.164 (+351912345678). A máscara portuguesa de nove dígitos acrescenta o indicativo.

const PORTUGUES = new RegExp(`^(?:\\+?${regiao.indicativo})?([239]\\d{8})$`);

/** Aceita "912 345 678", "+351 912-345-678"… e devolve "+351912345678"; null se não for um número português. */
export function telefoneE164(texto: string): string | null {
  const partes = PORTUGUES.exec(texto.replace(/[\s.-]/g, ""));
  return partes ? `+${regiao.indicativo}${partes[1]}` : null;
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
