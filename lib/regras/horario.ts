import { momentoLocal } from "@/lib/formatacao/datas";

// A barbearia está aberta agora? Serve para avisar o cliente que pede um código fora de
// horas (E.4). Não decide nada que se grave: a agenda valida-se na base de dados.

export type HorarioBarbearia = {
  hora_abertura: string;
  hora_fecho: string;
  dias_descanso: number[];
  aberto: boolean;
};

export function estaAberta(h: HorarioBarbearia, agora: Date = new Date()): boolean {
  const { diaSemana, hora } = momentoLocal(agora);
  if (!h.aberto || h.dias_descanso.includes(diaSemana)) return false;
  return hora >= normalizar(h.hora_abertura) && hora < normalizar(h.hora_fecho);
}

/** A base de dados devolve «09:00:00»; aceita também «09:00». */
const normalizar = (hora: string) => (hora.length === 5 ? `${hora}:00` : hora);
