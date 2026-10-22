// Módulo de faturação (G.4): preparado e desligado (D-01, D-03, D-04, D-126). Não é código
// morto: está atrás de um interruptor, testado, e só o super_admin o liga (CLAUDE.md, regra 13).

export type ModoEmissao = "certificado" | "portal" | "nenhum";
export type Emitente = "barbearia" | "profissional";

export type DadosDocumento = {
  emitente: Emitente;
  nifCliente: string | null;
  descricao: string;
  valorCent: number;
  /** Isenção de IVA do emitente (art. 53.º), quando aplicável. */
  isentoIva: boolean;
};

/** O que cada programa certificado tem de saber fazer (Moloni ou InvoiceXpress, D-04). */
export interface AdaptadorFaturacao {
  readonly fornecedor: string;
  emitir(d: DadosDocumento): Promise<{ numero: string }>;
  anular(numero: string): Promise<boolean>;
}
