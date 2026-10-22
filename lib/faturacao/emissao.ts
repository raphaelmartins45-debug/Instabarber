import type { DadosDocumento, Emitente, ModoEmissao } from "./tipos";

// Quem emite e o que se prepara (G.4, D-03): decide-se pelo modelo de caixa do profissional.

/** Modelo A: a barbearia fatura ao cliente; B e C: o barbeiro. */
export function emitenteDoModelo(modelo: "A" | "B" | "C"): Emitente {
  return modelo === "A" ? "barbearia" : "profissional";
}

/**
 * O resultado de preparar um documento em cada modo: com programa certificado, emite-se; no
 * Portal das Finanças, fica «por emitir» com os dados prontos; sem modo, nada (versão 1).
 */
export function acaoDoModo(modo: ModoEmissao): "emitir" | "por_emitir" | "nada" {
  if (modo === "certificado") return "emitir";
  if (modo === "portal") return "por_emitir";
  return "nada";
}

/** Os dados que o barbeiro copia para o Portal das Finanças (modo «portal»). */
export function dadosParaPortal(d: DadosDocumento): string[] {
  return [
    d.nifCliente ?? "",
    d.descricao,
    (d.valorCent / 100).toFixed(2),
    d.isentoIva ? "M10" : "",
  ];
}
