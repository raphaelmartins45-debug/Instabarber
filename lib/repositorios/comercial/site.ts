import "server-only";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import type { PedidoContactoFase1, PedidoContactoFase2 } from "@/lib/validacao/contacto";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// O pedido de contacto da landing grava-se no CRM (N.3, D-150): o limite por IP conta-se com a
// chave de serviço (CLAUDE.md §3); o lead entra por submeter_lead(), que o visitante pode chamar
// e que aplica o limite por contacto.

export type ResultadoLead = "gravado" | "limite_ip" | "limite_contacto" | "falhou";

export async function gravarLeadDoSite(
  ip: string,
  p: PedidoContactoFase1 | PedidoContactoFase2,
): Promise<ResultadoLead> {
  // Sem nome ou sem contacto (passo 2 enviado sozinho), não há lead a que juntar os dados.
  if (!p.nome || !(p.telemovel || p.email)) return "falhou";
  try {
    if (!(await consumirLimite(criarClienteServico(), `contacto:ip:${ip}`, LIMITES.contactoIp)))
      return "limite_ip";
    const bd = await criarClienteServidor();
    const { data, error } = await bd.rpc("submeter_lead", {
      p: {
        nome: p.nome,
        telefone: telefoneE164(p.telemovel) ?? p.telemovel,
        email: p.email,
        ...(p.fase === 2
          ? {
              passo: "2",
              barbearia: p.barbearia,
              cidade: p.cidade,
              barbeiros: p.barbeiros,
              distrito: p.distrito,
              dificuldade: p.dificuldade,
            }
          : {}),
      },
    });
    if (error) throw new Error(error.message);
    return data ? "gravado" : "limite_contacto";
  } catch (e) {
    // O e-mail ao comercial segue na mesma: o pedido não se perde se a base falhar.
    console.error("CRM: o pedido do site não ficou gravado", e);
    return "falhou";
  }
}
