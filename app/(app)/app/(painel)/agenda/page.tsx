import Link from "next/link";
import { AgendaDia } from "@/components/barbearia/agenda/agenda-dia";
import { SeletorDia } from "@/components/barbearia/agenda/seletor-dia";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { Button } from "@/components/ui/button";
import { exigirGestor } from "@/lib/equipa/contexto";
import { hojeIso } from "@/lib/formatacao/datas";
import { exigirFuncionalidade, lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { agendaDoDia } from "@/lib/painel/agenda";
import { listarOrfas } from "@/lib/repositorios/painel/agenda";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.agenda;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/** Agenda do dia por profissional (E.2), com marcação ao balcão. */
export default async function Agenda({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const contexto = await exigirGestor();
  await exigirFuncionalidade(contexto.barbearia.id, "agenda_basica");
  const hoje = hojeIso();
  const { dia: pedido } = await searchParams;
  const dia = pedido && /^\d{4}-\d{2}-\d{2}$/.test(pedido) ? pedido : hoje;
  const bd = await criarClienteServidor();
  const [agenda, grelha, orfas] = await Promise.all([
    agendaDoDia(bd, contexto.barbearia.id, dia),
    lerGrelha(contexto.barbearia.id),
    listarOrfas(bd, contexto.barbearia.id),
  ]);
  return (
    <PainelGestor atual="agenda">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-11">
            <Link href={`/app/agenda/marcar?dia=${dia}`}>{t.balcao.marcar}</Link>
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link href="/app/agenda/marcar?modo=registar">{t.balcao.registar}</Link>
          </Button>
        </div>
      </div>
      <SeletorDia dia={dia} hoje={hoje} base="/app/agenda" />
      {orfas.length ? (
        <Link
          href="/app/sistema/orfas"
          className="rounded-lg border border-destaque/40 bg-accent px-3 py-2 text-sm"
        >
          {t.orfas(orfas.length)}
        </Link>
      ) : null}
      <AgendaDia
        agenda={agenda}
        barbearia={contexto.barbearia.nome}
        lembretes={grelha.ativas.has("lembretes_marcacao")}
        marcar="/app/agenda/marcar"
      />
    </PainelGestor>
  );
}
