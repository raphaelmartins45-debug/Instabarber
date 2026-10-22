import { mensagemCliente, tipoSugerido } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import type { LinhaRadar } from "./radar";

// A mensagem sugerida para um cliente do radar, já como ligação wa.me (F.4.10).

export type MensagemPronta = {
  ligacao: string;
  conteudo: string;
  tipo: "recuperacao" | "posvenda";
};

/** Nula para quem não pode receber mensagens promocionais ou não tem histórico. */
export function mensagemParaCliente(
  l: LinhaRadar,
  pagina: string,
  assinatura: string,
): MensagemPronta | null {
  const tipo = tipoSugerido(l.classificacao.estado);
  const c = l.classificacao;
  if (!tipo || !l.contactavel || !l.cliente.telefone || !c.ultimaVisita || c.diasSemVir === null)
    return null;
  const conteudo = mensagemCliente({
    estado: c.estado,
    cliente: l.cliente.nome,
    diasSemVir: c.diasSemVir,
    ultimoServico: l.ultimoServico ?? "",
    ultimaVisita: c.ultimaVisita,
    pagina,
    assinatura,
  });
  return { ligacao: ligacaoWhatsApp(l.cliente.telefone, conteudo), conteudo, tipo };
}
