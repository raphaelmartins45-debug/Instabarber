import { NextResponse } from "next/server";
import { ipDoPedido } from "@/lib/inquilino/endereco";
import { caminhoImagemAdesao, verificarImagem } from "@/lib/regras/imagens";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { criarUrlCarregamento } from "@/lib/repositorios/imagens-adesao";
import { criarClienteServico } from "@/lib/supabase/servico";
import { esquemaCarregamento } from "@/lib/validacao/adesao";

// URL assinado para carregar uma imagem do formulário de adesão (D.8.1, C.7). O ficheiro vai
// para o bucket privado `comercial`, em adesoes/<pasta>/; só o super_admin o lê.

export async function POST(pedido: Request) {
  const v = esquemaCarregamento.safeParse(await pedido.json().catch(() => null));
  if (!v.success) return NextResponse.json({ erro: "invalido" }, { status: 400 });
  const { tipo, posicao, formato, tamanho, pasta } = v.data;
  const erro = verificarImagem(tipo, { formato, tamanho });
  if (erro) return NextResponse.json({ erro }, { status: 400 });

  const servico = criarClienteServico();
  if (
    !(await consumirLimite(
      servico,
      `carregamento:ip:${await ipDoPedido()}`,
      LIMITES.carregamentoIp,
    ))
  ) {
    return NextResponse.json({ erro: "limite" }, { status: 429 });
  }
  const caminho = caminhoImagemAdesao(pasta, tipo, posicao, formato);
  const token = await criarUrlCarregamento(servico, caminho);
  if (!token) return NextResponse.json({ erro: "carregar" }, { status: 502 });
  return NextResponse.json({ caminho, token });
}
