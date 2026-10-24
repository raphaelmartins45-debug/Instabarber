// NIF português com o dígito de controlo: a mesma regra de nif_valido() na base de dados.

const PRIMEIROS = new Set(["1", "2", "3", "5", "6", "8", "9"]);

export function nifValido(nif: string | null | undefined): boolean {
  if (!nif || !/^\d{9}$/.test(nif) || !PRIMEIROS.has(nif[0]!)) return false;
  const soma = [...nif.slice(0, 8)].reduce((s, d, i) => s + Number(d) * (9 - i), 0);
  const controlo = 11 - (soma % 11);
  return (controlo >= 10 ? 0 : controlo) === Number(nif[8]);
}
