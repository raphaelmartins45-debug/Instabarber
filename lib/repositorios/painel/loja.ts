import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Loja de produtos (F.4.4). O stock só muda ao levantar (levantar_pedido()); o pagamento é ao
// balcão, nunca online.

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  fotoUrl: string | null;
  custoCent: number;
  ivaPercent: number;
  precoCent: number;
  stock: number;
  stockMinimo: number;
  mostrarEsgotado: boolean;
  ativo: boolean;
};

export async function listarProdutos(bd: ClienteBD, inquilinoId: string): Promise<Produto[]> {
  const { data, error } = await bd
    .from("produtos")
    .select(
      "id, nome, descricao, foto_url, custo, iva_percent, preco_venda, stock, stock_minimo, mostrar_esgotado, ativo",
    )
    .eq("inquilino_id", inquilinoId)
    .order("nome");
  if (error) falhaDeLeitura("produtos", error);
  return data.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    fotoUrl: p.foto_url,
    custoCent: centimosDeNumeric(p.custo),
    ivaPercent: Number(p.iva_percent),
    precoCent: centimosDeNumeric(p.preco_venda),
    stock: p.stock,
    stockMinimo: p.stock_minimo,
    mostrarEsgotado: p.mostrar_esgotado,
    ativo: p.ativo,
  }));
}

export async function gravarProduto(
  bd: ClienteBD,
  inquilinoId: string,
  id: string | null,
  p: Omit<Produto, "id" | "fotoUrl"> & { fotoUrl?: string },
): Promise<boolean> {
  const linha = {
    nome: p.nome,
    descricao: p.descricao,
    custo: numericParaGravar(p.custoCent),
    iva_percent: p.ivaPercent,
    preco_venda: numericParaGravar(p.precoCent),
    stock: p.stock,
    stock_minimo: p.stockMinimo,
    mostrar_esgotado: p.mostrarEsgotado,
    ativo: p.ativo,
    ...(p.fotoUrl ? { foto_url: p.fotoUrl } : {}),
  };
  const { error } = id
    ? await bd.from("produtos").update(linha).eq("inquilino_id", inquilinoId).eq("id", id)
    : await bd.from("produtos").insert({ ...linha, inquilino_id: inquilinoId });
  return !error;
}

export type Pedido = {
  id: string;
  numero: number;
  estado: string;
  totalCent: number;
  criadoEm: string;
  clienteId: string;
  cliente: string;
  telefone: string | null;
  linhas: { produto: string; quantidade: number; precoCent: number }[];
};

export async function listarPedidos(bd: ClienteBD, inquilinoId: string): Promise<Pedido[]> {
  const { data, error } = await bd
    .from("pedidos_loja")
    .select(
      "id, numero, estado, total, criado_em, cliente_id, clientes(nome, telefone), pedido_linhas(quantidade, preco_unitario, produtos(nome))",
    )
    .eq("inquilino_id", inquilinoId)
    .order("criado_em", { ascending: false })
    .limit(200);
  if (error) falhaDeLeitura("pedidos_loja", error);
  return data.map((p) => ({
    id: p.id,
    numero: p.numero,
    estado: p.estado,
    totalCent: centimosDeNumeric(p.total),
    criadoEm: p.criado_em,
    clienteId: p.cliente_id,
    cliente: p.clientes?.nome ?? "",
    telefone: p.clientes?.telefone ?? null,
    linhas: p.pedido_linhas.map((l) => ({
      produto: l.produtos?.nome ?? "",
      quantidade: l.quantidade,
      precoCent: centimosDeNumeric(l.preco_unitario),
    })),
  }));
}

const motivo = (m: string) => m.match(/^[a-z_]+$/)?.[0] ?? "erro";

/** Novo → Pronto, ou Cancelado (o RLS só deixa estes estados; levantar é pela função). */
export async function mudarEstadoPedido(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
  estado: "pronto" | "cancelado",
): Promise<boolean> {
  const agora = new Date().toISOString();
  const { data, error } = await bd
    .from("pedidos_loja")
    .update(estado === "pronto" ? { estado, pronto_em: agora } : { estado, cancelado_em: agora })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .in("estado", estado === "pronto" ? ["novo"] : ["novo", "pronto"])
    .select("id");
  return !error && data.length > 0;
}

export async function levantarPedido(
  bd: ClienteBD,
  id: string,
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const { error } = await bd.rpc("levantar_pedido", { p_pedido: id });
  return error ? { ok: false, motivo: motivo(error.message) } : { ok: true };
}
