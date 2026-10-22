import { obterContextoEquipa } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { relatorioDoMes } from "@/lib/painel/relatorio";
import { lerMesRelatorio } from "@/lib/painel/relatorio-acesso";
import { gerarRelatorioPdf, nomeFicheiroRelatorio } from "@/lib/pdf/relatorio";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { obterProfissional } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// O PDF do relatório mensal (E.5), gerado no servidor com a marca da barbearia. O gestor
// descarrega o da barbearia e o de qualquer barbeiro; o barbeiro, só o seu.

const naoEncontrado = () => new Response(null, { status: 404 });

export async function GET(pedido: Request) {
  const url = new URL(pedido.url);
  const contexto = await obterContextoEquipa();
  const profissionalId = url.searchParams.get("profissional");
  const id = contexto.barbearia.id;
  const grelha = await lerGrelha(id);
  if (profissionalId === null) {
    if (!contexto.eGestor || !grelha.ativas.has("relatorio_mensal")) return naoEncontrado();
  } else if (
    !/^[0-9a-f-]{36}$/.test(profissionalId) ||
    !grelha.ativas.has("relatorios_por_profissional") ||
    (!contexto.eGestor && contexto.profissionalId !== profissionalId)
  )
    return naoEncontrado();

  const bd = await criarClienteServidor();
  const [b, profissional] = await Promise.all([
    obterConfiguracao(bd, id),
    profissionalId ? obterProfissional(bd, id, profissionalId) : null,
  ]);
  if (profissionalId && !profissional) return naoEncontrado();
  const mes = lerMesRelatorio(url.searchParams.get("mes"));
  const r = await relatorioDoMes(bd, b, mes, profissionalId, grelha.ativas);
  const titulo = profissional?.nome_apresentado ?? b.nome;
  const pdf = gerarRelatorioPdf(r, {
    barbearia: b.nome,
    titulo,
    cor: b.capa_cor ?? "#12100E",
    mensagens: grelha.ativas.has("envio_mensagens"),
  });
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeFicheiroRelatorio(mes, titulo)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
