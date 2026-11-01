"use server";

import { ePapelPlataforma } from "@/lib/admin/acesso";
import { caminhoSeguro } from "@/lib/inquilino/encaminhar";
import {
  entradaEquipaAqui,
  ipDoPedido,
  lerEndereco,
  origemDoPedido,
} from "@/lib/inquilino/endereco";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { criarClienteServico } from "@/lib/supabase/servico";
import { eContaCliente } from "@/lib/regras/conta-cliente";
import { listarMeusPerfis } from "@/lib/repositorios/perfis";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  esquemaDefinirPalavraPasse,
  esquemaEntradaEquipa,
  esquemaRecuperar,
  type DadosDefinirPalavraPasse,
  type DadosEntradaEquipa,
} from "@/lib/validacao/acesso";

// Entrada da equipa (B.6): e-mail e palavra-passe. O papel decide o painel.
// As ações devolvem o destino e o browser navega: assim o pedido passa sempre pelo
// middleware, que resolve a barbearia do endereço (L.4).

export type Resultado = { erro?: string; enviado?: boolean; destino?: string } | undefined;

/** No endereço de uma barbearia, as páginas da equipa vivem debaixo de /app. */
async function prefixoEquipa(): Promise<string> {
  return (await lerEndereco()).slug ? "/app" : "";
}

export async function entrarEquipa(dados: DadosEntradaEquipa): Promise<Resultado> {
  const v = esquemaEntradaEquipa.safeParse(dados);
  // As contas técnicas dos clientes não entram por aqui.
  if (!v.success || eContaCliente(v.data.email)) return { erro: "credenciais" };
  // Limite de tentativas por conta e IP (D-187): trava a adivinha de palavras-passe.
  const chave = `entrar:${v.data.email.toLowerCase()}:${await ipDoPedido()}`;
  if (!(await consumirLimite(criarClienteServico(), chave, LIMITES.entrarEquipaIp)))
    return { erro: "limite" };

  const bd = await criarClienteServidor();
  const { data, error } = await bd.auth.signInWithPassword({
    email: v.data.email,
    password: v.data.palavra_passe,
  });
  if (error || !data.user) return { erro: error?.status === 429 ? "limite" : "credenciais" };

  const perfis = await listarMeusPerfis(bd, data.user.id);
  if (perfis.length === 0) {
    await bd.auth.signOut();
    return { erro: "sem_acesso" };
  }
  const soAdmin = perfis.every((p) => ePapelPlataforma(p.papel));
  return { destino: soAdmin ? "/admin" : caminhoSeguro(v.data.seguinte, "/app") };
}

export async function recuperarPalavraPasse(dados: { email: string }): Promise<Resultado> {
  const v = esquemaRecuperar.safeParse(dados);
  if (!v.success) return { erro: "email" };
  // Limite por IP (D-187); a resposta continua a mesma, exista ou não a conta.
  if (
    !(await consumirLimite(
      criarClienteServico(),
      `recuperar:ip:${await ipDoPedido()}`,
      LIMITES.recuperarIp,
    ))
  )
    return { enviado: true };
  if (!eContaCliente(v.data.email)) {
    const bd = await criarClienteServidor();
    const destino = `${await origemDoPedido()}${await prefixoEquipa()}/entrar/confirmar`;
    // A resposta é sempre a mesma, exista ou não a conta.
    await bd.auth.resetPasswordForEmail(v.data.email, { redirectTo: destino });
  }
  return { enviado: true };
}

export async function definirPalavraPasse(dados: DadosDefinirPalavraPasse): Promise<Resultado> {
  const v = esquemaDefinirPalavraPasse.safeParse(dados);
  if (!v.success) return { erro: v.error.issues[0]?.message ?? "generico" };
  const bd = await criarClienteServidor();
  const { error } = await bd.auth.updateUser({ password: v.data.palavra_passe });
  if (error) {
    if (error.code === "weak_password" || error.code === "same_password") return { erro: "fraca" };
    return { erro: "ligacao" };
  }
  // O /app encaminha cada papel para o seu painel (o super_admin vai para o /admin).
  return { destino: "/app" };
}

/** Sair: no endereço da barbearia, volta à página de entrada do seu papel (D-180). */
export async function sair(): Promise<{ destino: string }> {
  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  const perfis = user ? await listarMeusPerfis(bd, user.id) : [];
  const gestor = perfis.length === 0 || perfis.some((p) => p.papel !== "profissional");
  await bd.auth.signOut();
  return { destino: await entradaEquipaAqui(gestor ? "gestor" : "barbeiro") };
}
