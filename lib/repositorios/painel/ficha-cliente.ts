import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// O que a ficha do cliente mostra além dos dados (E.2): selos, clube, loja, faltas e ficha técnica.
// O RLS decide o que o barbeiro vê (só os seus clientes).

export type MovimentoSelos = { id: string; tipo: string; quantidade: number; criadoEm: string };

export async function listarMovimentosSelos(
  bd: ClienteBD,
  clienteId: string,
): Promise<MovimentoSelos[]> {
  const { data, error } = await bd
    .from("movimentos_selos")
    .select("id, tipo, quantidade, criado_em")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("movimentos_selos", error);
  return data.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    quantidade: m.quantidade,
    criadoEm: m.criado_em,
  }));
}

export type SubscricaoCliente = {
  id: string;
  clube: string;
  estado: string;
  proximaRenovacao: string;
};

export async function listarSubscricoesCliente(
  bd: ClienteBD,
  clienteId: string,
): Promise<SubscricaoCliente[]> {
  const { data, error } = await bd
    .from("subscricoes")
    .select("id, estado, proxima_renovacao, clubes(nome)")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("subscricoes", error);
  return data.map((s) => ({
    id: s.id,
    clube: s.clubes?.nome ?? "",
    estado: s.estado,
    proximaRenovacao: s.proxima_renovacao,
  }));
}

export type PedidoCliente = {
  id: string;
  numero: number;
  estado: string;
  totalCent: number;
  criadoEm: string;
};

export async function listarPedidosCliente(
  bd: ClienteBD,
  clienteId: string,
): Promise<PedidoCliente[]> {
  const { data, error } = await bd
    .from("pedidos_loja")
    .select("id, numero, estado, total, criado_em")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("pedidos_loja", error);
  return data.map((p) => ({
    id: p.id,
    numero: p.numero,
    estado: p.estado,
    totalCent: centimosDeNumeric(p.total),
    criadoEm: p.criado_em,
  }));
}

/** Faltas do cliente (as mais recentes primeiro). */
export async function listarFaltas(bd: ClienteBD, clienteId: string): Promise<string[]> {
  const { data, error } = await bd
    .from("marcacoes")
    .select("inicio")
    .eq("cliente_id", clienteId)
    .eq("estado", "falta")
    .order("inicio", { ascending: false });
  if (error) falhaDeLeitura("marcacoes", error);
  return data.map((m) => m.inicio);
}

export type NotaTecnica = {
  id: string;
  nota: string | null;
  fotoPath: string | null;
  fotoUrl: string | null;
  profissional: string | null;
  criadoPor: string | null;
  criadoEm: string;
};

export const BUCKET_FICHAS = "fichas";

export async function listarFichaTecnica(bd: ClienteBD, clienteId: string): Promise<NotaTecnica[]> {
  const { data, error } = await bd
    .from("fichas_tecnicas")
    .select("id, nota, foto_path, criado_por, criado_em, profissionais(nome_apresentado)")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("fichas_tecnicas", error);
  const caminhos = data.flatMap((f) => (f.foto_path ? [f.foto_path] : []));
  const urls = new Map<string, string>();
  if (caminhos.length) {
    const { data: assinadas } = await bd.storage
      .from(BUCKET_FICHAS)
      .createSignedUrls(caminhos, 600);
    assinadas?.forEach((a) => a.path && a.signedUrl && urls.set(a.path, a.signedUrl));
  }
  return data.map((f) => ({
    id: f.id,
    nota: f.nota,
    fotoPath: f.foto_path,
    fotoUrl: f.foto_path ? (urls.get(f.foto_path) ?? null) : null,
    profissional: f.profissionais?.nome_apresentado ?? null,
    criadoPor: f.criado_por,
    criadoEm: f.criado_em,
  }));
}

/** Nova nota da ficha técnica, com fotografia opcional no bucket privado `fichas`. */
export async function criarNotaTecnica(
  bd: ClienteBD,
  d: {
    inquilinoId: string;
    clienteId: string;
    profissionalId: string | null;
    nota: string | null;
    foto: { dados: ArrayBuffer; tipo: string; extensao: string } | null;
    criadoPor: string;
  },
): Promise<boolean> {
  let caminho: string | null = null;
  if (d.foto) {
    caminho = `${d.inquilinoId}/${d.clienteId}/${crypto.randomUUID()}.${d.foto.extensao}`;
    const { error } = await bd.storage
      .from(BUCKET_FICHAS)
      .upload(caminho, d.foto.dados, { contentType: d.foto.tipo });
    if (error) return false;
  }
  const { error } = await bd.from("fichas_tecnicas").insert({
    inquilino_id: d.inquilinoId,
    cliente_id: d.clienteId,
    profissional_id: d.profissionalId,
    nota: d.nota,
    foto_path: caminho,
    criado_por: d.criadoPor,
  });
  if (error && caminho) await bd.storage.from(BUCKET_FICHAS).remove([caminho]);
  return !error;
}

export async function apagarNotaTecnica(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("fichas_tecnicas")
    .delete()
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("foto_path");
  if (error || data.length === 0) return false;
  const foto = data[0]?.foto_path;
  if (foto) await bd.storage.from(BUCKET_FICHAS).remove([foto]);
  return true;
}
