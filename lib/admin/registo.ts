import "server-only";
import { numericParaGravar } from "@/lib/formatacao/dinheiro";
import { calcularMensalidadeCent } from "@/lib/regras/mensalidade";
import {
  definirCampanha,
  definirCortesia,
  definirImplementacao,
} from "@/lib/repositorios/admin/barbearias";
import { fecharPropostaNoRegisto } from "@/lib/repositorios/comercial/propostas";
import { criarPedidoDoPainel } from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { RegistoBarbearia } from "@/lib/validacao/registo-barbearia";
import { aprovarPedido, type ResultadoAprovacao } from "./aprovacao";
import { exigirSuperAdmin } from "./contexto";

// Registo de uma barbearia pelo painel (D-189): cria um pedido de adesão com a origem «painel» e
// aprova-o pelo caminho de sempre (barbearia, conta do dono por ligação segura, boas-vindas com
// o guia). Depois fixa a implementação por cobrar e a cortesia.

export type ResultadoRegisto =
  | ResultadoAprovacao
  | { ok: false; erro: "pedido" | "implementacao" | "cortesia" | "campanha" | "proposta" };

export async function registarBarbeariaNoPainel(d: RegistoBarbearia): Promise<ResultadoRegisto> {
  const admin = await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const pedidoId = await criarPedidoDoPainel(bd, {
    nome: d.nome,
    responsavel: d.responsavel,
    nif: d.nif || null,
    telefone: d.telefone || null,
    whatsapp: d.telefone || null,
    email: d.email_acesso,
    cidade: d.cidade || null,
    morada: d.morada || null,
    plano: d.plano,
    periodicidade: d.periodicidade,
    profissionais: d.profissionais,
    mensalidade_calculada: numericParaGravar(calcularMensalidadeCent(d.plano, d.profissionais)),
    email_acesso: d.email_acesso,
    observacoes: `Registada no painel (${admin.email}).`,
    aceitou_termos_em: new Date().toISOString(),
  });
  if (!pedidoId) return { ok: false, erro: "pedido" };
  const r = await aprovarPedido(pedidoId, {});
  if (!r.ok) return r;
  if (d.implementacao !== "nenhuma") {
    const i = await definirImplementacao(bd, r.inquilinoId, d.implementacao, d.valor_implementacao);
    if (!i.ok) return { ok: false, erro: "implementacao" };
  }
  // A campanha (D-190) vem depois: fixa a periodicidade e, se o disser, a implementação.
  if (d.campanha_id) {
    const k = await definirCampanha(bd, r.inquilinoId, d.campanha_id);
    if (!k.ok) return { ok: false, erro: "campanha" };
  }
  // A partir de uma proposta (D-195): proposta aceite, lead ganho e ligado, comissão pendente.
  if (d.proposta_id && !(await fecharPropostaNoRegisto(bd, d.proposta_id, r.inquilinoId)))
    return { ok: false, erro: "proposta" };
  if (d.cortesia) {
    const c = await definirCortesia(bd, r.inquilinoId, true, d.cortesia_ate || null);
    if (!c.ok) return { ok: false, erro: "cortesia" };
  }
  return r;
}
