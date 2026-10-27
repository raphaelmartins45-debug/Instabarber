"use server";

import { avisoContratoCarregado } from "@/lib/email/contrato-cliente";
import { enviarEmail } from "@/lib/email/enviar";
import { ipDoPedido, origemDoPedido } from "@/lib/inquilino/endereco";
import {
  caminhoCarregado,
  contratoDoCliente,
  registarCarregamento,
} from "@/lib/repositorios/comercial/contratos";
import { criarUrlCarregamento } from "@/lib/repositorios/imagens-adesao";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// O cliente carrega o contrato assinado pela ligação do e-mail (D-181). A ligação valida-se na
// base de dados (só o hash); a chave de serviço só cria o URL de carregamento (autorizado pelo
// dono, D-181) e conta o limite de tentativas.

type Preparado = { ok: true; caminho: string; token: string } | { ok: false; erro: string };

export async function prepararCarregamentoCliente(ligacao: string): Promise<Preparado> {
  const c = await contratoDoCliente(await criarClienteServidor(), ligacao);
  if (!c) return { ok: false, erro: "invalida" };
  const servico = criarClienteServico();
  const ip = await ipDoPedido();
  if (!(await consumirLimite(servico, `contrato:ip:${ip}`, LIMITES.contratoClienteIp)))
    return { ok: false, erro: "limite" };
  const caminho = caminhoCarregado(c.lead_id, c.id);
  const token = await criarUrlCarregamento(servico, caminho);
  return token ? { ok: true, caminho, token } : { ok: false, erro: "generico" };
}

export async function confirmarCarregamentoCliente(ligacao: string): Promise<{ ok: boolean }> {
  const bd = await criarClienteServidor();
  const c = await contratoDoCliente(bd, ligacao);
  if (!c) return { ok: false };
  const ok = await registarCarregamento(bd, ligacao, caminhoCarregado(c.lead_id, c.id));
  if (ok) {
    const ficha = `${await origemDoPedido()}/admin/comercial/leads/${c.lead_id}`;
    // A falha do aviso não desfaz o carregamento: o contrato aparece «Por conferir» na ficha.
    await enviarEmail(() =>
      avisoContratoCarregado({ numero: c.numero, nome: c.contratante ?? "", ficha }),
    );
  }
  return { ok };
}
