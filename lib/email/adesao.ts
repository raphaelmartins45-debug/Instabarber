import "server-only";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Preco } from "@/lib/regras/mensalidade";
import type { PedidoAdesao } from "@/lib/validacao/adesao";
import { enderecos } from "./enderecos";
import type { Email } from "./enviar";

const t = textos.adesao;

/** Aviso curto à Performa LAB quando chega um pedido de adesão (D.8.2, passo 3). */
export function avisoNovaAdesao(p: PedidoAdesao, preco: Preco, ligacao: string): Email {
  const k = p.contratacao;
  const plano = t.contratacao.planos[k.plano];
  const periodo = k.periodicidade === "anual" ? "ano" : "mês";
  const pagamento = t.contratacao.pagamentos[k.preferencia_pagamento];
  const linha = t.email.linha(
    p.identidade.nome,
    plano,
    k.profissionais,
    formatarDinheiro(preco.semIva),
    formatarDinheiro(preco.comIva),
    periodo,
    pagamento,
  );
  return {
    de: enderecos.remetente(),
    para: enderecos.notificacoes(),
    assunto: t.email.assunto(
      p.identidade.nome,
      plano,
      k.profissionais,
      formatarDinheiro(preco.comIva),
    ),
    texto: [linha, "", t.email.abrir(ligacao), "", textos.marca.assinatura].join("\n"),
  };
}
