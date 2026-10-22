import { createHmac } from "node:crypto";

// Código TOTP (RFC 6238, SHA-1, 30 s, 6 dígitos) a partir da chave base32 que o ecrã mostra.

function base32(texto: string): Buffer {
  const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of texto.replace(/=+$/, "").toUpperCase()) {
    bits += alfabeto.indexOf(c).toString(2).padStart(5, "0");
  }
  const bytes = bits.match(/.{8}/g) ?? [];
  return Buffer.from(bytes.map((b) => parseInt(b, 2)));
}

export function codigoTotp(segredo: string, agora = Date.now()): string {
  const contador = Buffer.alloc(8);
  contador.writeBigUInt64BE(BigInt(Math.floor(agora / 30_000)));
  const hmac = createHmac("sha1", base32(segredo)).update(contador).digest();
  const deslocamento = hmac[hmac.length - 1]! & 0xf;
  const valor = (hmac.readUInt32BE(deslocamento) & 0x7fffffff) % 1_000_000;
  return valor.toString().padStart(6, "0");
}
