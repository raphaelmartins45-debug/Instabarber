import Link from "next/link";
import { LinhaMarcacao } from "@/components/barbearia/agenda/linha-marcacao";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { IndicadoresProfissional } from "@/components/barbearia/profissional/indicadores-profissional";
import { BarraProgresso } from "@/components/nucleo/barra-progresso";
import { Secao } from "@/components/nucleo/secao";
import { exigirGestor } from "@/lib/equipa/contexto";
import { hojeIso } from "@/lib/formatacao/datas";
import { exigirFuncionalidade, lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { intervaloDoDia } from "@/lib/painel/calendario";
import { indicadoresDia } from "@/lib/painel/indicadores";
import { listarMarcacoes } from "@/lib/repositorios/painel/agenda";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { cn } from "@/lib/utils";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.profissional;
export const metadata = { title: `${t.equipaTitulo} · ${vertical.camadas.gestao}` };

/** Equipa (E.2): um separador por profissional, com os seus indicadores, agenda e objetivo. */
export default async function Equipa({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const contexto = await exigirGestor();
  const inq = contexto.barbearia.id;
  await exigirFuncionalidade(inq, "painel_profissional");
  const bd = await criarClienteServidor();
  const [equipa, grelha] = await Promise.all([listarEquipa(bd, inq), lerGrelha(inq)]);
  const ativos = equipa.filter((p) => p.ativo);
  const { p } = await searchParams;
  const escolhido = ativos.find((x) => x.id === p) ?? ativos[0];
  const metas = grelha.ativas.has("metas_profissional");
  const [indicadores, marcacoes] = escolhido
    ? await Promise.all([
        indicadoresDia(bd, inq, escolhido.id),
        listarMarcacoes(bd, inq, intervaloDoDia(hojeIso()), { profissionalId: escolhido.id }),
      ])
    : [null, []];
  const agora = new Date();

  return (
    <PainelGestor atual="equipa">
      <h1 className="text-[22px] font-extrabold">{t.equipaTitulo}</h1>
      {!escolhido || !indicadores ? (
        <p className="text-sm text-muted-foreground">{t.semEquipa}</p>
      ) : (
        <>
          <nav aria-label={t.equipaTitulo} className="flex gap-2 overflow-x-auto pb-1">
            {ativos.map((x) => (
              <Link
                key={x.id}
                href={`/app/equipa?p=${x.id}`}
                aria-current={x.id === escolhido.id ? "page" : undefined}
                className={cn(
                  "flex h-10 shrink-0 items-center rounded-full border px-4 text-sm",
                  x.id === escolhido.id
                    ? "border-foreground bg-foreground text-background"
                    : "bg-card hover:bg-muted",
                )}
              >
                {x.nome_apresentado}
              </Link>
            ))}
          </nav>
          <IndicadoresProfissional i={indicadores} metas={metas} />
          {metas && indicadores.progresso.objetivoCent ? (
            <Secao id="progresso" titulo={t.progresso}>
              <BarraProgresso
                percentagem={indicadores.progresso.percentagem}
                rotulo={t.progresso}
              />
            </Secao>
          ) : null}
          <Secao id="agenda" titulo={t.agendaHoje}>
            {marcacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{textos.agenda.semMarcacoes}</p>
            ) : (
              <ul className="grid gap-2 md:grid-cols-2">
                {marcacoes.map((m) => (
                  <LinhaMarcacao key={m.id} m={m} lembrete={null} agora={agora} />
                ))}
              </ul>
            )}
          </Secao>
          <Link
            href={`/app/equipa/${escolhido.id}`}
            className="text-sm text-ligacao underline-offset-4 hover:underline"
          >
            {t.verArea}
          </Link>
        </>
      )}
    </PainelGestor>
  );
}
