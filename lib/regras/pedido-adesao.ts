import { numericDeCentimos } from "@/lib/formatacao/dinheiro";
import type { PedidoAdesao } from "@/lib/validacao/adesao";
import { calcularMensalidadeCent, calcularPrecoCent, type RegimeIva } from "./mensalidade";

// Converte o pedido validado no jsonb que submeter_pedido_adesao() espera. A mensalidade
// é sempre calculada aqui, pela fórmula única (D.7), nunca aceite do browser.

export function paraSubmissao(p: PedidoAdesao): Record<string, unknown> {
  const { identidade: i, contactos: c, servicos: s, contratacao: k } = p;
  return {
    nome: i.nome,
    responsavel: i.responsavel,
    nif: i.nif,
    ano_abertura: i.ano_abertura,
    descricao: i.descricao || null,
    telefone: c.telefone,
    whatsapp: c.whatsapp || null,
    email: c.email,
    cidade: c.cidade,
    morada: c.morada,
    instagram: c.instagram || null,
    facebook: c.facebook || null,
    tiktok: c.tiktok || null,
    google_maps_url: c.google_maps_url || null,
    hora_abertura: c.hora_abertura,
    hora_fecho: c.hora_fecho,
    dias_descanso: c.dias_descanso,
    intervalo_almoco_inicio: c.intervalo_almoco_inicio || null,
    intervalo_almoco_fim: c.intervalo_almoco_fim || null,
    servicos: s.servicos.map((x) => ({
      nome: x.nome,
      duracao_min: x.duracao_min,
      preco: numericDeCentimos(x.preco),
    })),
    equipa: s.equipa,
    logo_path: i.logo_path,
    capa_path: i.capa_path || null,
    galeria_paths: i.galeria_paths,
    plano: k.plano,
    periodicidade: k.periodicidade,
    profissionais: k.profissionais,
    mensalidade_calculada: numericDeCentimos(calcularMensalidadeCent(k.plano, k.profissionais)),
    modelo_caixa: s.modelo_caixa,
    preferencia_pagamento: k.preferencia_pagamento,
    email_acesso: k.email_acesso,
    observacoes: k.observacoes || null,
    aceitou_termos: k.aceitou_termos,
  };
}

/** O preço do pedido, para o aviso à Performa LAB e para o resumo em PDF. */
export function precoDoPedido(p: PedidoAdesao, regime: RegimeIva) {
  const k = p.contratacao;
  return calcularPrecoCent(k.plano, k.profissionais, k.periodicidade, false, regime);
}
