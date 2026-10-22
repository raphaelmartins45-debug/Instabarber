import { dataCurta, hojeIso, somarDias } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarAusencias } from "@/lib/repositorios/painel/agenda";
import { listarFeriados } from "@/lib/repositorios/feriados";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { instanteLocal } from "@/lib/formatacao/datas";
import { FormularioAusencias, type LinhaAusencia, type LinhaFeriado } from "./formulario-ausencias";

const t = textos.sistema.ausencias;

/** Ausências (por barbeiro ou da barbearia inteira) e feriados próprios (E.2). */
export async function SeccaoAusencias({ inquilinoId }: { inquilinoId: string }) {
  const bd = await criarClienteServidor();
  const hoje = hojeIso();
  const ate = somarDias(hoje, 400);
  const [equipa, ausencias, feriados] = await Promise.all([
    listarEquipa(bd, inquilinoId),
    listarAusencias(bd, inquilinoId, {
      de: instanteLocal(somarDias(hoje, -30), "00:00"),
      ate: instanteLocal(ate, "00:00"),
    }),
    listarFeriados(bd, inquilinoId, hoje.slice(0, 4) + "-01-01", ate),
  ]);
  const nome = new Map(equipa.map((p) => [p.id, p.nome_apresentado]));
  const linhas: LinhaAusencia[] = ausencias.map((a) => ({
    id: a.id,
    quem: a.profissionalId ? (nome.get(a.profissionalId) ?? "") : t.barbearia,
    tipo: a.tipo,
    inicio: a.inicio,
    fim: a.fim,
    motivo: a.motivo,
  }));
  const proprios: LinhaFeriado[] = feriados
    .filter((f) => f.inquilino_id)
    .map((f) => ({ id: f.id, data: f.data, nome: f.nome }));
  const nacionais = feriados.filter((f) => !f.inquilino_id && f.data >= hoje).slice(0, 15);
  return (
    <div className="grid gap-6">
      <FormularioAusencias
        ausencias={linhas}
        feriados={proprios}
        profissionais={equipa
          .filter((p) => p.ativo)
          .map((p) => ({ id: p.id, rotulo: p.nome_apresentado }))}
        hoje={hoje}
      />
      <section className="grid gap-2">
        <h3 className="text-[15px] font-bold">{t.nacionais}</h3>
        <ul className="grid gap-1 text-sm text-muted-foreground">
          {nacionais.map((f) => (
            <li key={f.id}>
              {dataCurta(`${f.data}T12:00:00Z`)} · {f.nome}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
