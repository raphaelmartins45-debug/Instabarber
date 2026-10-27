"use server";

import { z } from "zod";
import { ipDoPedido, lerEndereco } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { emailTecnicoCliente } from "@/lib/regras/conta-cliente";
import { estaAberta } from "@/lib/regras/horario";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  esquemaEntradaCliente,
  esquemaPedirCodigo,
  type DadosEntradaCliente,
} from "@/lib/validacao/acesso";

// Entrada do cliente (E.4): telemóvel e palavra-passe; pedido de código quando ainda não
// tem acesso ou se esqueceu da palavra-passe (F.9).

const slug = z.string().max(40);

export async function entrarCliente(
  dados: DadosEntradaCliente & { slug: string },
): Promise<{ erro: string } | { destino: string }> {
  const v = esquemaEntradaCliente.safeParse(dados);
  const s = slug.safeParse(dados.slug);
  if (!v.success || !s.success) return { erro: "credenciais" };
  const barbearia = await obterBarbeariaDoEndereco(s.data);
  if (!barbearia?.id) return { erro: "credenciais" };
  if (
    !(await consumirLimite(
      criarClienteServico(),
      `entrar-cliente:ip:${await ipDoPedido()}`,
      LIMITES.entrarClienteIp,
    ))
  ) {
    return { erro: "limite" };
  }

  const bd = await criarClienteServidor();
  const { error } = await bd.auth.signInWithPassword({
    email: emailTecnicoCliente(v.data.telefone, barbearia.id),
    password: v.data.palavra_passe,
  });
  if (error) return { erro: "credenciais" };
  // O browser navega para o destino (ver app/(auth)/entrar/acoes.ts).
  return { destino: `${(await lerEndereco()).base}/minha-area` };
}

export async function sairCliente(): Promise<{ destino: string }> {
  await (await criarClienteServidor()).auth.signOut();
  return { destino: `${(await lerEndereco()).base}/cliente` };
}

/**
 * Pede o código. A resposta é sempre a mesma, exista ou não o número (pedir_codigo_acesso):
 * só diz se a barbearia está fechada, para o cliente saber quando o vai receber.
 */
export async function pedirCodigo(dados: {
  slug: string;
  telefone: string;
}): Promise<{ erro: string } | { pedido: true; foraDeHoras: boolean }> {
  const v = esquemaPedirCodigo.safeParse(dados);
  const s = slug.safeParse(dados.slug);
  if (!v.success || !s.success) return { erro: "telemovel" };
  const barbearia = await obterBarbeariaDoEndereco(s.data);
  if (!barbearia?.id) return { erro: "generico" };
  if (
    !(await consumirLimite(
      criarClienteServico(),
      `pedir-codigo:ip:${await ipDoPedido()}`,
      LIMITES.pedirCodigoIp,
    ))
  ) {
    return { erro: "limite" };
  }

  const bd = await criarClienteServidor();
  const { error } = await bd.rpc("pedir_codigo_acesso", {
    p_inquilino: barbearia.id,
    p_telefone: v.data.telefone,
  });
  if (error) return { erro: "generico" };
  const foraDeHoras = !estaAberta({
    hora_abertura: barbearia.hora_abertura ?? "00:00:00",
    hora_fecho: barbearia.hora_fecho ?? "00:00:00",
    dias_descanso: barbearia.dias_descanso ?? [],
    aberto: barbearia.aberto ?? false,
  });
  return { pedido: true, foraDeHoras };
}
