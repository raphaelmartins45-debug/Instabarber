// Estimativa de espera da fila presencial (F.4.3): os minutos dos serviços de quem está à frente
// e o que falta das marcações em curso, repartidos pelos profissionais ativos.

export function esperaEstimada(d: {
  minutosAFrente: number;
  minutosEmCurso: number;
  profissionais: number;
}): number {
  const total = Math.max(0, d.minutosAFrente) + Math.max(0, d.minutosEmCurso);
  return Math.ceil(total / Math.max(1, d.profissionais));
}
