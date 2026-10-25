import type { DadosSaude } from "@/lib/admin/saude";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// A saúde das barbearias da carteira de um comercial (D-162), pela função saude_carteira():
// só contagens e o contacto da barbearia, para analisar o risco e cuidar do cliente.

export type BarbeariaCarteiraSaude = DadosSaude & {
  inquilinoId: string;
  nome: string;
  responsavel: string | null;
  telefone: string | null;
};

export async function saudeCarteira(
  bd: ClienteBD,
  userId?: string,
): Promise<BarbeariaCarteiraSaude[]> {
  const { data, error } = await bd.rpc("saude_carteira", userId ? { p_user: userId } : {});
  if (error) falhaDeLeitura("saude_carteira", error);
  return data.map((b) => ({
    inquilinoId: b.inquilino_id,
    nome: b.nome,
    responsavel: b.responsavel,
    telefone: b.telefone,
    estado: b.estado,
    estadoPagamento: b.estado_pagamento,
    aprovadaEm: b.aprovada_em,
    temLogotipo: b.tem_logotipo,
    servicosAtivos: b.servicos_ativos,
    profissionaisAtivos: b.profissionais_ativos,
    profissionaisComAcesso: b.profissionais_com_acesso,
    clientes: b.clientes,
    marcacoesTotal: b.marcacoes_total,
    marcacoesOnline: b.marcacoes_online,
    concluidas: b.concluidas,
    marcacoes30: b.marcacoes_30,
    marcacoesAnteriores30: b.marcacoes_anteriores_30,
    ultimaMarcacao: b.ultima_marcacao,
  }));
}
