import { Aniversariantes } from "@/components/barbearia/clientes/aniversariantes";
import { RadarClientes } from "@/components/barbearia/clientes/radar-clientes";
import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { mesAtual } from "@/lib/formatacao/datas";
import { exigirFuncionalidade } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { paginaPublica } from "@/lib/inquilino/endereco";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { lerFiltroRadar } from "@/lib/painel/filtro-radar";
import { radarClientes } from "@/lib/painel/radar";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

export const metadata = { title: `${textos.clientes.titulo} · ${vertical.camadas.equipa}` };

/**
 * Clientes do barbeiro (E.3): os que marcou, atendeu ou registou, classificados só com o
 * histórico com ele (regra de ouro). As mensagens vão assinadas com o nome dele.
 */
export default async function ClientesProfissional({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filtro?: string; q?: string }>;
}) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  const inq = area.contexto.barbearia.id;
  await exigirFuncionalidade(inq, "gestao_clientes");
  const q = await searchParams;
  const bd = await criarClienteServidor();
  const [radar, pagina, b] = await Promise.all([
    radarClientes(bd, inq, id),
    paginaPublica(area.contexto.barbearia.slug),
    obterConfiguracao(bd, inq),
  ]);
  // O gestor a ver a área do barbeiro: a lista é a dos clientes com histórico com ele.
  const linhas = area.proprio ? radar.linhas : radar.linhas.filter((l) => l.visitas > 0);
  const mensagens = area.grelha.ativas.has("envio_mensagens");
  const assinatura = area.profissional.nome_apresentado;
  return (
    <PainelProfissional area={area} atual="clientes">
      <h1 className="text-[22px] font-extrabold">{textos.clientes.titulo}</h1>
      <RadarClientes
        radar={{ ...radar, linhas }}
        filtro={lerFiltroRadar(q.filtro)}
        busca={q.q ?? ""}
        base={`/app/equipa/${id}/clientes`}
        ficha="/app/clientes"
        mensagens={mensagens}
        lote={area.grelha.ativas.has("envio_lote")}
        indicadoresRadar={area.grelha.ativas.has("clientes_perdidos")}
        pagina={pagina}
        assinatura={assinatura}
      />
      {area.grelha.ativas.has("campanha_aniversario") ? (
        <Aniversariantes
          linhas={linhas}
          mes={mesAtual()}
          mensagens={mensagens}
          desconto={
            b.desconto_aniversario_ativo
              ? formatarNumero(Number(b.desconto_aniversario_percent ?? 0))
              : null
          }
          assinatura={assinatura}
        />
      ) : null}
    </PainelProfissional>
  );
}
