import { differenceInHours } from "date-fns";

// Convite do barbeiro (E.3): se não entrar em 24 horas, o gestor vê «Reenviar convite».

export const HORAS_ATE_REENVIAR = 24;

export type EstadoConvite = "ativo" | "aguarda" | "reenviar";

export function estadoConvite(
  convidadoEm: string | null,
  ultimaEntrada: string | null,
  agora: Date = new Date(),
): EstadoConvite {
  if (ultimaEntrada) return "ativo";
  if (!convidadoEm) return "aguarda";
  return differenceInHours(agora, new Date(convidadoEm)) >= HORAS_ATE_REENVIAR
    ? "reenviar"
    : "aguarda";
}
