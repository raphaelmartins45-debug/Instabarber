import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import {
  BloqueiosBarbeiro,
  type LinhaBloqueio,
} from "@/components/barbearia/profissional/bloqueios-barbeiro";
import { HorarioBarbeiro } from "@/components/barbearia/sistema/horario-barbeiro";
import { Secao } from "@/components/nucleo/secao";
import { hojeIso, instanteLocal, somarDias } from "@/lib/formatacao/datas";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { listarAusencias } from "@/lib/repositorios/painel/agenda";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarHorarios } from "@/lib/repositorios/painel/horarios";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";
import { guardarMeuHorario } from "./acoes";

const t = textos.profissional.disponibilidade;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.equipa}` };

/**
 * A disponibilidade do barbeiro (D-202): os dias e as horas em que trabalha, dentro do horário
 * da barbearia, e as horas bloqueadas. O gestor vê e muda a de qualquer barbeiro.
 */
export default async function Disponibilidade({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  const barbeariaId = area.contexto.barbearia.id;
  await exigirFuncionalidade(barbeariaId, "agenda_basica");
  const bd = await criarClienteServidor();
  const hoje = hojeIso();
  const [config, horarios, ausencias] = await Promise.all([
    obterConfiguracao(bd, barbeariaId),
    listarHorarios(bd, barbeariaId),
    listarAusencias(bd, barbeariaId, {
      de: instanteLocal(hoje, "00:00"),
      ate: instanteLocal(somarDias(hoje, 90), "00:00"),
    }),
  ]);
  const hm = (h: string) => h.slice(0, 5);
  const pode = !area.contexto.apoio;
  const bloqueios: LinhaBloqueio[] = ausencias
    .filter((a) => a.profissionalId === id)
    .map((a) => ({
      id: a.id,
      inicio: a.inicio,
      fim: a.fim,
      tipo: a.tipo,
      motivo: a.motivo,
      podeRemover: pode && (area.contexto.eGestor || a.criadoPor === area.contexto.userId),
    }));
  return (
    <PainelProfissional area={area} atual="disponibilidade">
      <h1 className="text-titulo font-extrabold">{t.titulo}</h1>
      <Secao id="horario" titulo={t.horario}>
        <p className="text-sm text-muted-foreground">
          {t.horarioAjuda(hm(config.hora_abertura), hm(config.hora_fecho))}
        </p>
        {pode ? (
          <HorarioBarbeiro
            id={id}
            guardar={guardarMeuHorario}
            inicial={horarios
              .filter((h) => h.profissionalId === id)
              .map((h) => ({
                diaSemana: String(h.diaSemana),
                inicio: hm(h.inicio),
                fim: hm(h.fim),
              }))}
          />
        ) : null}
      </Secao>
      <Secao id="bloqueios" titulo={t.bloqueios}>
        <p className="text-sm text-muted-foreground">{t.bloqueiosAjuda}</p>
        {pode ? (
          <BloqueiosBarbeiro
            profissionalId={id}
            bloqueios={bloqueios}
            hoje={hoje}
            horario={{ abertura: hm(config.hora_abertura), fecho: hm(config.hora_fecho) }}
          />
        ) : null}
      </Secao>
    </PainelProfissional>
  );
}
