import { Aniversariantes } from "@/components/barbearia/clientes/aniversariantes";
import { RadarClientes } from "@/components/barbearia/clientes/radar-clientes";
import { PainelGestor } from "@/components/barbearia/painel-gestor";
import { exigirGestor } from "@/lib/equipa/contexto";
import { mesAtual } from "@/lib/formatacao/datas";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { exigirFuncionalidade, lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { paginaPublica } from "@/lib/inquilino/endereco";
import { lerFiltroRadar } from "@/lib/painel/filtro-radar";
import { radarClientes } from "@/lib/painel/radar";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.clientes;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.gestao}` };

/** Clientes do gestor (E.2): classificação com o histórico da barbearia inteira (F.1). */
export default async function Clientes({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; q?: string }>;
}) {
  const contexto = await exigirGestor();
  const id = contexto.barbearia.id;
  await exigirFuncionalidade(id, "gestao_clientes");
  const q = await searchParams;
  const bd = await criarClienteServidor();
  const [grelha, radar, b, pagina] = await Promise.all([
    lerGrelha(id),
    radarClientes(bd, id, null),
    obterConfiguracao(bd, id),
    paginaPublica(contexto.barbearia.slug),
  ]);
  const mensagens = grelha.ativas.has("envio_mensagens");
  return (
    <PainelGestor atual="clientes">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <RadarClientes
        radar={radar}
        filtro={lerFiltroRadar(q.filtro)}
        busca={q.q ?? ""}
        base="/app/clientes"
        mensagens={mensagens}
        lote={grelha.ativas.has("envio_lote")}
        indicadoresRadar={grelha.ativas.has("clientes_perdidos")}
        pagina={pagina}
        assinatura={contexto.barbearia.nome}
      />
      {grelha.ativas.has("campanha_aniversario") ? (
        <Aniversariantes
          linhas={radar.linhas}
          mes={mesAtual()}
          mensagens={mensagens}
          desconto={
            b.desconto_aniversario_ativo
              ? formatarNumero(Number(b.desconto_aniversario_percent ?? 0))
              : null
          }
          assinatura={contexto.barbearia.nome}
        />
      ) : null}
    </PainelGestor>
  );
}
