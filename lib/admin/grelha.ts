// Estado de cada funcionalidade na grelha do Admin (D.3, D.4). Função pura.

export type EstadoFuncionalidade = "pacote" | "bonus" | "inativa" | "desativada";

export function estadoFuncionalidade(noPacote: boolean, ativa: boolean): EstadoFuncionalidade {
  if (ativa) return noPacote ? "pacote" : "bonus";
  return noPacote ? "desativada" : "inativa";
}
