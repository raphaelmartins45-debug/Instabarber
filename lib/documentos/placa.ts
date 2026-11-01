import "server-only";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import { enderecosDaBarbearia } from "@/lib/inquilino/encaminhar";
import { type DadosPlaca, gerarPlaca } from "@/lib/pdf/placa";
import { sugestaoPlaca } from "@/lib/regras/placa";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { EscolhaPlaca } from "@/lib/validacao/placa";
import { lerLogo } from "./logo";

// A placa do balcão (D-185): os dados da barbearia e os textos sugeridos, para o formulário do
// gestor e para o PDF (do gestor e do Admin). O prémio dos selos vem do serviço configurado.

export async function sugestaoDaBarbearia(bd: ClienteBD, inquilinoId: string) {
  const [b, grelha, servicos] = await Promise.all([
    obterConfiguracao(bd, inquilinoId),
    lerGrelha(inquilinoId),
    listarServicos(bd, inquilinoId),
  ]);
  const premio =
    b.premio_ativo && b.premio_servico_id
      ? (servicos.find((s) => s.id === b.premio_servico_id)?.nome ?? null)
      : null;
  const selosAtivos = grelha.ativas.has("fidelizacao_selos");
  return {
    b,
    selosAtivos,
    sugestao: sugestaoPlaca({
      selosAtivos,
      selosNecessarios: b.selos_necessarios,
      premio,
    }),
  };
}

/** O PDF da placa, com a escolha do gestor ou, sem ela, com os textos sugeridos. */
export async function pdfPlaca(
  bd: ClienteBD,
  inquilinoId: string,
  escolha?: EscolhaPlaca,
): Promise<{ nome: string; conteudo: Buffer; slug: string }> {
  const { b, sugestao, selosAtivos } = await sugestaoDaBarbearia(bd, inquilinoId);
  const e = enderecosDaBarbearia({
    slug: b.slug,
    dominioProprio: b.dominio_proprio,
    raiz: process.env.ROOT_DOMAIN || "instabarber.pt",
    origem: await origemDoPedido(),
  });
  const dados: DadosPlaca = {
    ...(escolha ?? sugestao),
    barbearia: b.nome,
    cor: b.capa_cor,
    logo: await lerLogo(b.logo_url),
    qr: e.marcar,
    endereco: e.pagina,
    selos: selosAtivos ? b.selos_necessarios : null,
  };
  return {
    nome: `placa-do-balcao-${b.slug}.pdf`,
    conteudo: Buffer.from(gerarPlaca(dados).output("arraybuffer")),
    slug: b.slug,
  };
}
