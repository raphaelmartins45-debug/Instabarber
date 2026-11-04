import { diaSemanaDe, somarDias } from "@/lib/formatacao/datas";

// O primeiro dia em que ainda se pode marcar (D-202): hoje, se a barbearia ainda não fechou; senão
// o próximo dia aberto. Os dias de descanso saltam-se. A hora é a de Lisboa, já formatada.

export function primeiroDiaMarcavel(d: {
  /** A data de hoje em Lisboa (AAAA-MM-DD). */
  hoje: string;
  /** A hora de agora em Lisboa (HH:MM). */
  horaAgora: string;
  /** A hora de fecho da barbearia (HH:MM ou HH:MM:SS). */
  fecho: string;
  /** Dias de descanso (0 = domingo). */
  diasDescanso: readonly number[];
}): string {
  let dia = d.horaAgora >= d.fecho.slice(0, 5) ? somarDias(d.hoje, 1) : d.hoje;
  for (let i = 0; i < 7 && d.diasDescanso.includes(diaSemanaDe(dia)); i++) dia = somarDias(dia, 1);
  return dia;
}
