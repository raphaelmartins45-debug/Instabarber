import "server-only";
import { contaComLigacaoDeConvite, ligacaoDeRecuperacao } from "@/lib/auth/contas";
import { boasVindas, respostaRejeicao } from "@/lib/email/adesao-decisao";
import { enviarEmail } from "@/lib/email/enviar";
import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import { slugValido } from "@/lib/inquilino/host";
import { calcularMensalidadeCent, type Periodicidade, type Plano } from "@/lib/regras/mensalidade";
import { slugDoNome, slugLivre } from "@/lib/regras/slug";
import {
  alterarBarbearia,
  apagarBarbeariaNova,
  aplicarPacote,
  criarBarbearia,
  slugsComPrefixo,
} from "@/lib/repositorios/admin/barbearias";
import { registarAcaoAdmin } from "@/lib/repositorios/admin/auditoria";
import { criarServicos } from "@/lib/repositorios/admin/servicos";
import { publicarImagem } from "@/lib/repositorios/imagens-adesao";
import {
  criarPerfilProprietario,
  listarProprietarios,
  procurarUtilizadorPorEmail,
} from "@/lib/repositorios/perfis";
import {
  decidirPedido,
  obterPedido,
  type PedidoAdesaoLinha,
} from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { exigirSuperAdmin } from "./contexto";

// Aprovação e rejeição de um pedido de adesão (D.8.2, E.1). Tudo com a sessão do super_admin
// (RLS), exceto a conta do proprietário, que só a chave de serviço cria (CLAUDE.md §3).

export type Ajustes = {
  slug?: string;
  plano?: Plano;
  periodicidade?: Periodicidade;
  profissionais?: number;
};
export type ResultadoAprovacao =
  | { ok: true; inquilinoId: string; emailEnviado: boolean }
  | { ok: false; erro: "ja_decidido" | "slug" | "profissionais" | "falhou" };

type Servico = { nome: string; duracao_min: number; preco: string | number };

export async function aprovarPedido(
  pedidoId: string,
  ajustes: Ajustes,
): Promise<ResultadoAprovacao> {
  const admin = await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const pedido = await obterPedido(bd, pedidoId);
  if (!pedido || pedido.estado !== "pendente") return { ok: false, erro: "ja_decidido" };

  const plano = ajustes.plano ?? (pedido.plano as Plano);
  const periodicidade = ajustes.periodicidade ?? (pedido.periodicidade as Periodicidade);
  const profissionais = ajustes.profissionais ?? pedido.profissionais;
  try {
    calcularMensalidadeCent(plano, profissionais);
  } catch {
    return { ok: false, erro: "profissionais" };
  }
  const slug = await escolherSlug(bd, ajustes.slug, pedido.nome);
  if (!slug) return { ok: false, erro: "slug" };

  const criada = await criarBarbearia(bd, {
    nome: pedido.nome,
    slug,
    responsavel: pedido.responsavel,
    nif: pedido.nif,
    ano_abertura: pedido.ano_abertura,
    descricao: pedido.descricao,
    telefone: pedido.telefone,
    whatsapp: pedido.whatsapp,
    email: pedido.email,
    cidade: pedido.cidade,
    morada: pedido.morada,
    instagram: pedido.instagram,
    facebook: pedido.facebook,
    tiktok: pedido.tiktok,
    google_maps_url: pedido.google_maps_url,
    ...(pedido.hora_abertura ? { hora_abertura: pedido.hora_abertura } : {}),
    ...(pedido.hora_fecho ? { hora_fecho: pedido.hora_fecho } : {}),
    ...(pedido.dias_descanso ? { dias_descanso: pedido.dias_descanso } : {}),
    intervalo_almoco_inicio: pedido.intervalo_almoco_inicio,
    intervalo_almoco_fim: pedido.intervalo_almoco_fim,
    modelo_caixa_omissao: pedido.modelo_caixa,
    plano,
    periodicidade,
    profissionais_contratados: profissionais,
    estado: "ativo",
  });
  if (!criada.ok) return { ok: false, erro: criada.motivo.includes("23505") ? "slug" : "falhou" };
  const inquilinoId = criada.id;

  const origem = await origemDoPedido();
  const servico = criarClienteServico();
  let ligacao: string | null = null;
  try {
    if (!(await aplicarPacote(bd, inquilinoId))) throw new Error("pacote");
    const servicos = (pedido.servicos as Servico[]).map((s) => ({
      nome: s.nome,
      duracao_min: s.duracao_min,
      preco_centimos: centimosDeNumeric(s.preco),
    }));
    if (!(await criarServicos(bd, inquilinoId, servicos))) throw new Error("servicos");
    const imagens = await publicarImagens(bd, inquilinoId, pedido);
    const conta = await contaComLigacaoDeConvite(
      servico,
      { email: pedido.email_acesso, destino: `${origem}/entrar/confirmar` },
      (e) => procurarUtilizadorPorEmail(servico, e),
    );
    if (!conta.ok) throw new Error("conta");
    ligacao = conta.ligacao;
    const perfil = await criarPerfilProprietario(bd, {
      userId: conta.userId,
      inquilinoId,
      nome: pedido.responsavel ?? pedido.nome,
      email: pedido.email_acesso,
    });
    if (!perfil) throw new Error("perfil");
    const fim = await alterarBarbearia(bd, inquilinoId, {
      ...imagens,
      aprovado_em: new Date().toISOString(),
    });
    if (!fim.ok) throw new Error("aprovado_em");
  } catch (erro) {
    console.error("aprovacao_falhou", erro instanceof Error ? erro.message : erro);
    await apagarBarbeariaNova(bd, inquilinoId);
    return { ok: false, erro: "falhou" };
  }

  await decidirPedido(bd, pedidoId, { estado: "aprovado", inquilinoId, revistoPor: admin.userId });
  await registarAcaoAdmin(bd, {
    inquilinoId,
    accao: "adesao_aprovada",
    entidade: "pedidos_adesao",
    entidadeId: pedidoId,
    detalhes: { slug, plano, periodicidade, profissionais },
  });
  const emailEnviado = await enviarEmail(() =>
    boasVindas({
      para: pedido.email_acesso,
      responsavel: pedido.responsavel ?? pedido.nome,
      barbearia: pedido.nome,
      paginaUrl: `${origem}/${slug}`,
      painelUrl: `${origem}/app`,
      ligacaoPalavraPasse: ligacao,
    }),
  );
  return { ok: true, inquilinoId, emailEnviado };
}

export async function rejeitarPedido(pedidoId: string, motivo: string): Promise<boolean> {
  const admin = await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const pedido = await obterPedido(bd, pedidoId);
  if (!pedido) return false;
  if (
    !(await decidirPedido(bd, pedidoId, { estado: "rejeitado", motivo, revistoPor: admin.userId }))
  )
    return false;
  await registarAcaoAdmin(bd, {
    inquilinoId: null,
    accao: "adesao_rejeitada",
    entidade: "pedidos_adesao",
    entidadeId: pedidoId,
    detalhes: { motivo },
  });
  await enviarEmail(() =>
    respostaRejeicao({
      para: pedido.email_acesso,
      responsavel: pedido.responsavel ?? pedido.nome,
      barbearia: pedido.nome,
      motivo,
    }),
  );
  return true;
}

/** Reenvia as boas-vindas ao proprietário, com uma ligação nova para definir a palavra-passe. */
export async function reenviarBoasVindas(
  inquilinoId: string,
  barbearia: { nome: string; slug: string },
): Promise<boolean> {
  await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const [dono] = await listarProprietarios(bd, inquilinoId);
  if (!dono?.email) return false;
  const origem = await origemDoPedido();
  const ligacao = await ligacaoDeRecuperacao(
    criarClienteServico(),
    dono.email,
    `${origem}/entrar/confirmar`,
  );
  if (!ligacao) return false;
  await registarAcaoAdmin(bd, {
    inquilinoId,
    accao: "boas_vindas_reenviadas",
    entidade: "perfis",
    entidadeId: dono.id,
  });
  return enviarEmail(() =>
    boasVindas({
      para: dono.email!,
      responsavel: dono.nome ?? barbearia.nome,
      barbearia: barbearia.nome,
      paginaUrl: `${origem}/${barbearia.slug}`,
      painelUrl: `${origem}/app`,
      ligacaoPalavraPasse: ligacao,
    }),
  );
}

async function escolherSlug(
  bd: ClienteBD,
  ajustado: string | undefined,
  nome: string,
): Promise<string | null> {
  if (ajustado) return slugValido(ajustado) ? ajustado : null;
  const desejado = slugDoNome(nome);
  return slugLivre(desejado, new Set(await slugsComPrefixo(bd, desejado)));
}

/** Copia as imagens aprovadas para publico/<inquilino>/ e devolve os URLs públicos. */
async function publicarImagens(bd: ClienteBD, inquilinoId: string, p: PedidoAdesaoLinha) {
  const destino = (origem: string) => `${inquilinoId}/${origem.split("/").pop()}`;
  const logo = p.logo_path ? await publicarImagem(bd, p.logo_path, destino(p.logo_path)) : null;
  const capa = p.capa_path ? await publicarImagem(bd, p.capa_path, destino(p.capa_path)) : null;
  const galeria: string[] = [];
  for (const caminho of p.galeria_paths) {
    const url = await publicarImagem(bd, caminho, destino(caminho));
    if (url) galeria.push(url);
  }
  return {
    logo_url: logo,
    capa_foto_url: capa,
    // A fachada é sempre a primeira fotografia da galeria (D.8.1).
    galeria_urls: [...(capa ? [capa] : []), ...galeria].slice(0, 6),
  };
}
