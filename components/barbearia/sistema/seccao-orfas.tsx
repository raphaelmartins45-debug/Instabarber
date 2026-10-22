import { dataHora } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarOrfas } from "@/lib/repositorios/painel/agenda";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { AtribuirOrfa } from "./atribuir-orfa";

const t = textos.agenda.orfasSeccao;

/** Marcações sem profissional (E.2, F.7): a lista das órfãs, com atribuição manual. */
export async function SeccaoOrfas({ inquilinoId }: { inquilinoId: string }) {
  const bd = await criarClienteServidor();
  const [orfas, equipa] = await Promise.all([
    listarOrfas(bd, inquilinoId),
    listarEquipa(bd, inquilinoId),
  ]);
  if (orfas.length === 0) return <p className="text-sm text-muted-foreground">{t.vazio}</p>;
  const opcoes = equipa
    .filter((p) => p.ativo)
    .map((p) => ({ id: p.id, rotulo: p.nome_apresentado }));
  return (
    <ul className="grid gap-2">
      {orfas.map((m) => (
        <li key={m.id} className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
          <span>
            <span className="font-semibold">{dataHora(m.inicio)}</span> · {m.cliente} · {m.servico}
          </span>
          <AtribuirOrfa id={m.id} opcoes={opcoes} />
        </li>
      ))}
    </ul>
  );
}
