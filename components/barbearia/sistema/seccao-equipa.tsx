import { FormularioBarbeiro } from "@/components/barbearia/formulario-barbeiro";
import { ListaEquipa, type LinhaEquipa } from "@/components/barbearia/lista-equipa";
import { lerEntradas } from "@/lib/auth/contas";
import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { estadoConvite } from "@/lib/regras/convite";
import { listarHorarios } from "@/lib/repositorios/painel/horarios";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { contasDosPerfis } from "@/lib/repositorios/perfis";
import { listarComissoesServico, listarFichasEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FichaBarbeiro } from "./ficha-barbeiro";

/**
 * Equipa (E.2, E.3): registo por convite e, para cada barbeiro, horário próprio, comissão por
 * omissão e por serviço, modelo de caixa (com «Aplicar a todos»), renda no modelo C e acesso.
 */
export async function SeccaoEquipa({
  inquilinoId,
  escolhido,
}: {
  inquilinoId: string;
  escolhido?: string;
}) {
  const bd = await criarClienteServidor();
  const equipa = await listarFichasEquipa(bd, inquilinoId);
  const contas = await contasDosPerfis(
    bd,
    equipa.flatMap((p) => (p.perfil_id ? [p.perfil_id] : [])),
  );
  const entradas = await lerEntradas(criarClienteServico(), [...contas.values()]);
  const linhas: LinhaEquipa[] = equipa.map((p) => {
    const entrada = p.perfil_id ? entradas.get(contas.get(p.perfil_id) ?? "") : undefined;
    return {
      id: p.id,
      nome: p.nome,
      email: p.email,
      ativo: p.ativo,
      estado: estadoConvite(entrada?.convidadoEm ?? null, entrada?.ultimaEntrada ?? null),
    };
  });
  const ficha = equipa.find((p) => p.id === escolhido);
  const [servicos, horarios, comissoes] = ficha
    ? await Promise.all([
        listarServicos(bd, inquilinoId),
        listarHorarios(bd, inquilinoId),
        listarComissoesServico(bd, ficha.id),
      ])
    : [[], [], new Map<string, number>()];

  return (
    <div className="grid gap-4">
      <ListaEquipa linhas={linhas} />
      {ficha ? (
        <FichaBarbeiro
          key={ficha.id}
          ficha={{
            id: ficha.id,
            nome: ficha.nome,
            ativo: ficha.ativo,
            comissao: String(Number(ficha.comissao_percent)),
            modelo: ficha.modelo_caixa,
            rendaCent: ficha.renda_valor === null ? null : centimosDeNumeric(ficha.renda_valor),
            rendaDia: ficha.renda_dia_vencimento,
          }}
          servicos={servicos.map((s) => ({ id: s.id, nome: s.nome, precoCent: s.precoCent }))}
          comissoes={Object.fromEntries(comissoes)}
          horario={horarios
            .filter((h) => h.profissionalId === ficha.id)
            .map((h) => ({
              diaSemana: String(h.diaSemana),
              inicio: h.inicio.slice(0, 5),
              fim: h.fim.slice(0, 5),
            }))}
        />
      ) : null}
      <h3 className="text-[15px] font-bold">{textos.paineis.equipa.registar}</h3>
      <FormularioBarbeiro />
    </div>
  );
}
