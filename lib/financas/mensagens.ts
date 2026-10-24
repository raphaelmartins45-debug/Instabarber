import { textos } from "@/lib/i18n/pt-PT";

// Lembretes de vencimento (O.9): três textos-modelo escolhidos pelos dias que faltam. Os textos
// vivem em lib/i18n (financas.vencimentos.modelos); aqui escolhe-se e monta-se. O valor vem
// sempre da fórmula única (mensalidade.ts), já formatado por quem chama.

const t = textos.financas.vencimentos;

export type DadosLembrete = {
  responsavel: string | null;
  barbearia: string;
  plano: string;
  valorComIva: string;
  vencimento: string;
  dias: number;
};

export type ModeloLembrete = "aviso" | "hoje" | "atraso";

export const modeloPelosDias = (dias: number): ModeloLembrete =>
  dias > 0 ? "aviso" : dias === 0 ? "hoje" : "atraso";

/** O texto proposto, que o operador lê e pode editar antes de enviar. */
export function textoLembrete(d: DadosLembrete): string {
  const nome = d.responsavel?.trim().split(/\s+/)[0] || d.barbearia;
  const m = t.modelos;
  const assinatura = textos.marca.assinatura;
  switch (modeloPelosDias(d.dias)) {
    case "aviso":
      return [
        m.aviso(nome, d.barbearia, d.plano, d.valorComIva, d.vencimento),
        t.pagamento,
        m.obrigado,
        assinatura,
      ].join("\n\n");
    case "hoje":
      return [
        m.hoje(nome, d.barbearia, d.plano, d.valorComIva),
        t.pagamento,
        m.obrigado,
        assinatura,
      ].join("\n\n");
    case "atraso":
      return [
        m.atraso(nome, d.barbearia, d.plano, d.valorComIva, d.vencimento),
        m.atrasoPedido(-d.dias),
        t.pagamento,
        assinatura,
      ].join("\n\n");
  }
}

export type FiltroVencimentos = "7" | "15" | "atraso" | "todos";

export function filtrarVencimentos<T extends { dias: number }>(
  linhas: T[],
  filtro: FiltroVencimentos,
) {
  if (filtro === "todos") return linhas;
  if (filtro === "atraso") return linhas.filter((l) => l.dias < 0);
  const limite = Number(filtro);
  return linhas.filter((l) => l.dias >= 0 && l.dias <= limite);
}
