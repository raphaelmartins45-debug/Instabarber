import Link from "next/link";
import { AgendaDia } from "@/components/barbearia/agenda/agenda-dia";
import { SeletorDia } from "@/components/barbearia/agenda/seletor-dia";
import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { Button } from "@/components/ui/button";
import { hojeIso } from "@/lib/formatacao/datas";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { agendaDoDia } from "@/lib/painel/agenda";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.agenda;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.equipa}` };

/** Agenda própria do barbeiro (E.3): só as marcações dele, ausências e vagas livres. */
export default async function AgendaProfissional({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dia?: string }>;
}) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  await exigirFuncionalidade(area.contexto.barbearia.id, "agenda_basica");
  const hoje = hojeIso();
  const { dia: pedido } = await searchParams;
  const dia = pedido && /^\d{4}-\d{2}-\d{2}$/.test(pedido) ? pedido : hoje;
  const agenda = await agendaDoDia(
    await criarClienteServidor(),
    area.contexto.barbearia.id,
    dia,
    id,
  );
  const base = `/app/equipa/${id}/agenda`;
  return (
    <PainelProfissional area={area} atual="agenda">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
        <Button asChild className="h-11">
          <Link href={`/app/agenda/marcar?dia=${dia}&profissional=${id}`}>{t.balcao.marcar}</Link>
        </Button>
      </div>
      <SeletorDia dia={dia} hoje={hoje} base={base} />
      <AgendaDia
        agenda={agenda}
        barbearia={area.contexto.barbearia.nome}
        lembretes={area.grelha.ativas.has("lembretes_marcacao")}
        marcar="/app/agenda/marcar"
      />
    </PainelProfissional>
  );
}
