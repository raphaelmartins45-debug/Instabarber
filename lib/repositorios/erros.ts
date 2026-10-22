/** Erro de leitura de um repositório. A mensagem é para os registos, nunca para o ecrã. */
export function falhaDeLeitura(origem: string, erro: { message: string }): never {
  throw new Error(`Leitura falhou (${origem}): ${erro.message}`);
}
