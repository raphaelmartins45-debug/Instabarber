import Link from "next/link";
import { AgendaDia } from "@/components/barbearia/agenda/agenda-dia";
import { SeletorDia } from "@/components/barbearia/agenda/seletor-dia";
import { FilaMensagens } from "@/components/barbearia/fila-mensagens";
import { FilasDoDia } from "@/components/barbearia/filas/filas-do-dia";
import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { Button } from "@/components/ui/button";
import { hojeIso } from "@/lib/formatacao/datas";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { agendaDoDia } from "@/lib/painel/agenda";
import { prepararMensagensAgenda } from "@/lib/painel/mensagens-agenda";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
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
  const bd = await criarClienteServidor();
  const [agenda, b] = await Promise.all([
    agendaDoDia(bd, area.contexto.barbearia.id, dia, id),
    obterConfiguracao(bd, area.contexto.barbearia.id),
  ]);
  const { avaliacoes, lote } = await prepararMensagensAgenda(
    bd,
    area.contexto.barbearia.id,
    area.contexto.barbearia.nome,
    agenda,
    area.grelha.ativas,
    b.google_avaliacao_url,
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
      <FilaMensagens key={dia} itens={lote} titulo={textos.mensagensLote.tituloLembretes} />
      <AgendaDia
        agenda={agenda}
        barbearia={area.contexto.barbearia.nome}
        lembretes={area.grelha.ativas.has("lembretes_marcacao")}
        avaliacoes={avaliacoes}
        marcar="/app/agenda/marcar"
      />
      <FilasDoDia
        inquilinoId={area.contexto.barbearia.id}
        barbearia={area.contexto.barbearia.nome}
        dia={dia}
      />
    </PainelProfissional>
  );
}
