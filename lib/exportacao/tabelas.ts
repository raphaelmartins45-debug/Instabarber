// Tabelas que entram na exportação dos dados de uma barbearia (E.1, P-12). São os dados que a
// barbearia trata como responsável; as tabelas da plataforma (faturação da Performa LAB, adesão,
// auditoria, comercial, módulos desligados, códigos de acesso efémeros) ficam de fora.

export const TABELAS_DA_BARBEARIA = [
  "perfis",
  "profissionais",
  "horarios_profissional",
  "ausencias",
  "feriados",
  "servicos",
  "comissoes_servico",
  "clientes",
  "fichas_tecnicas",
  "clubes",
  "clube_servicos",
  "subscricoes",
  "ciclos_clube",
  "creditos_clube",
  "cartoes_oferta",
  "marcacoes",
  "visitas",
  "movimentos_selos",
  "movimentos_cartao",
  "periodos_desconto",
  "promocoes",
  "portfolio_fotos",
  "fila_espera",
  "fila_presencial",
  "produtos",
  "pedidos_loja",
  "pedido_linhas",
  "mensagens",
  "custos_fixos",
  "despesas",
  "objetivos",
  "acertos",
] as const;

export const TABELAS_DA_PLATAFORMA = [
  "codigos_acesso",
  "inquilino_funcionalidades",
  "pedidos_adesao",
  "faturas_plataforma",
  "recebimentos",
  "auditoria",
  "inquilino_modulos",
  "ligacoes_externas",
  "pagamentos",
  "documentos_fiscais",
  "leads",
  "contratos",
  "lembretes_vencimento",
] as const;

/** As tabelas da barbearia com coluna cliente_id: a exportação de um só cliente. */
export const TABELAS_DO_CLIENTE = [
  "fichas_tecnicas",
  "subscricoes",
  "marcacoes",
  "visitas",
  "movimentos_selos",
  "fila_espera",
  "fila_presencial",
  "pedidos_loja",
  "mensagens",
] as const;

export type TabelaExportada = (typeof TABELAS_DA_BARBEARIA)[number];
