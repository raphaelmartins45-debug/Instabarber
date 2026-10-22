import "server-only";

/** Lê uma variável de ambiente obrigatória. Se faltar, falha com o nome dela (L.2: nunca inventar um valor). */
export function variavel(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Falta a variável de ambiente ${nome}.`);
  return valor;
}
