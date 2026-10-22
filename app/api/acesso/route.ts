import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { definirContaCliente } from "@/lib/auth/contas";
import { ipDoPedido } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { emailTecnicoCliente } from "@/lib/regras/conta-cliente";
import { ligarContaCliente, obterContaCliente } from "@/lib/repositorios/clientes-conta";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaCriarAcesso } from "@/lib/validacao/acesso";

// Acesso do cliente por código (B9, F.9): verifica o código com a chave de serviço e cria
// (ou atualiza) a conta técnica do cliente nesta barbearia. Depois inicia a sessão.

const esquema = esquemaCriarAcesso.and(z.object({ slug: z.string().max(40) }));

export async function POST(pedido: NextRequest) {
  const v = esquema.safeParse(await pedido.json().catch(() => null));
  if (!v.success) return NextResponse.json({ erro: "dados" }, { status: 400 });
  const { slug, telefone, codigo, palavra_passe } = v.data;

  const barbearia = await obterBarbeariaDoEndereco(slug);
  if (!barbearia?.id) return NextResponse.json({ erro: "codigo" }, { status: 400 });

  const servico = criarClienteServico();
  if (
    !(await consumirLimite(servico, `criar-acesso:ip:${await ipDoPedido()}`, LIMITES.criarAcessoIp))
  ) {
    return NextResponse.json({ erro: "limite" }, { status: 429 });
  }

  // Cinco tentativas por código, uso único e 15 minutos (verificar_codigo_acesso).
  const { data: clienteId, error } = await servico.rpc("verificar_codigo_acesso", {
    p_inquilino: barbearia.id,
    p_telefone: telefone,
    p_codigo: codigo,
  });
  if (error || !clienteId) return NextResponse.json({ erro: "codigo" }, { status: 400 });

  const cliente = await obterContaCliente(servico, barbearia.id, clienteId);
  if (!cliente) return NextResponse.json({ erro: "codigo" }, { status: 400 });
  const email = emailTecnicoCliente(telefone, barbearia.id);
  const conta = await definirContaCliente(servico, {
    authUserId: cliente.auth_user_id,
    email,
    palavraPasse: palavra_passe,
  });
  if (!conta.ok)
    return NextResponse.json({ erro: conta.fraca ? "fraca" : "generico" }, { status: 400 });
  if (!cliente.auth_user_id) await ligarContaCliente(servico, cliente.id, conta.userId);

  const bd = await criarClienteServidor();
  await bd.auth.signInWithPassword({ email, password: palavra_passe });
  return NextResponse.json({ ok: true });
}
