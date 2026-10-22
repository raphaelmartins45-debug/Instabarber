import "server-only";
import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import { primeiroDoMes } from "@/lib/formatacao/datas";
import { linhaAcerto, montarAcerto, type LinhaAcerto } from "@/lib/regras/acertos";
import { listarAcertos, type RegistoAcerto } from "@/lib/repositorios/painel/acertos";
import { listarVisitas, type Visita } from "@/lib/repositorios/painel/visitas";
import { listarFichasEquipa } from "@/lib/repositorios/profissionais";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { intervaloDoMes } from "./calendario";

// Comissões e acertos de um mês (F.4.11): uma linha por barbeiro, montada a partir das visitas
// com os valores gravados. Serve o Financeiro do gestor e a folha de acerto do barbeiro.

export type LinhaAcertoProfissional = LinhaAcerto & {
  profissionalId: string;
  nome: string;
  ativo: boolean;
  registos: RegistoAcerto[];
};

export type AcertosDoMes = { linhas: LinhaAcertoProfissional[]; visitas: Visita[] };

export async function acertosDoMes(
  bd: ClienteBD,
  inquilinoId: string,
  anoMes: string,
  profissionalId: string | null = null,
): Promise<AcertosDoMes> {
  const [equipa, visitas, registos] = await Promise.all([
    listarFichasEquipa(bd, inquilinoId),
    listarVisitas(bd, inquilinoId, { ...intervaloDoMes(anoMes), profissionalId }),
    listarAcertos(bd, inquilinoId, {
      mes: primeiroDoMes(anoMes),
      profissionalId: profissionalId ?? undefined,
    }),
  ]);
  const linhas = equipa
    .filter((p) => (profissionalId ? p.id === profissionalId : true))
    .map((p): LinhaAcertoProfissional => {
      const minhas = visitas.filter((v) => v.profissionalId === p.id);
      const renda =
        p.modelo_caixa === "C" && p.renda_valor !== null ? centimosDeNumeric(p.renda_valor) : 0;
      const acerto = montarAcerto(
        p.modelo_caixa,
        minhas.map((v) => ({
          valorCobradoCent: v.valorCobradoCent,
          comissaoCent: v.comissaoCent,
          clube: v.clube,
        })),
        renda,
      );
      const meus = registos.filter((r) => r.profissionalId === p.id);
      return {
        ...linhaAcerto(
          acerto,
          meus.map((r) => ({ sentido: r.sentido, valorCent: r.valorCent })),
        ),
        profissionalId: p.id,
        nome: p.nome_apresentado,
        ativo: p.ativo,
        registos: meus,
      };
    })
    // Quem está inativo e não teve atividade no mês não aparece.
    .filter((l) => l.ativo || l.servicos > 0 || l.registos.length > 0);
  return { linhas, visitas };
}
