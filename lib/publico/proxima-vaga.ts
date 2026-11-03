import "server-only";
import { diaSemanaDe, hojeIso, horaCurta, somarDias } from "@/lib/formatacao/datas";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { vagasPublicas } from "@/lib/repositorios/marcacao-publica";
import type { ClienteBD } from "@/lib/supabase/tipos";

// A próxima vaga da capa (D-198): a primeira hora livre do serviço principal nos próximos dias,
// pela mesma função da marcação (vagas_livres). Só informa; a vaga decide-se ao marcar.

const DIAS = 3;

export async function proximaVaga(
  bd: ClienteBD,
  inquilinoId: string,
  servicoId: string,
  t: TextosPublicos,
): Promise<string | null> {
  const hoje = hojeIso();
  for (let n = 0; n < DIAS; n++) {
    const dia = somarDias(hoje, n);
    const vagas = await vagasPublicas(bd, inquilinoId, servicoId, dia, null).catch(() => []);
    const agora = Date.now();
    const vaga = vagas.find((v) => new Date(v.inicio).getTime() > agora);
    if (!vaga) continue;
    const hora = horaCurta(vaga.inicio);
    if (n === 0) return t.capa.hoje(hora);
    if (n === 1) return t.capa.amanha(hora);
    return t.capa.noDia(t.dias[diaSemanaDe(dia)]!, hora);
  }
  return null;
}
