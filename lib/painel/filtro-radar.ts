import type { FiltroRadar } from "./radar";

const VALIDOS: FiltroRadar[] = [
  "todos",
  "ativo",
  "em_risco",
  "perdido",
  "sem_historico",
  "nao_registados",
];

/** O filtro do radar a partir do endereço (?filtro=); desconhecido = todos. */
export function lerFiltroRadar(valor: string | undefined): FiltroRadar {
  return VALIDOS.includes(valor as FiltroRadar) ? (valor as FiltroRadar) : "todos";
}
