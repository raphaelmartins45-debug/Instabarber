import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Histórico de cortes (F.4.14, D-179): a ficha técnica do cliente, uma entrada por serviço, com
// até duas fotografias no bucket privado `fichas`, nota interna (só a equipa) e nota para o
// cliente. O RLS decide o que o barbeiro vê (só os seus clientes); a base de dados recusa
// fotografias sem o consentimento do cliente.

export const BUCKET_FICHAS = "fichas";

export type NotaTecnica = {
  id: string;
  nota: string | null;
  notaCliente: string | null;
  fotoUrls: string[];
  visivelCliente: boolean;
  marcacaoId: string | null;
  /** O dia do serviço ligado (ou o da escrita) e o serviço, quando há marcação. */
  data: string;
  servico: string | null;
  profissional: string | null;
  criadoPor: string | null;
};

/** URLs assinados (10 minutos) das fotografias, com a sessão de quem pede (RLS do Storage). */
export async function assinarFotos(
  bd: ClienteBD,
  caminhos: string[],
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (caminhos.length === 0) return urls;
  const { data } = await bd.storage.from(BUCKET_FICHAS).createSignedUrls(caminhos, 600);
  data?.forEach((a) => a.path && a.signedUrl && urls.set(a.path, a.signedUrl));
  return urls;
}

export async function listarFichaTecnica(bd: ClienteBD, clienteId: string): Promise<NotaTecnica[]> {
  const { data, error } = await bd
    .from("fichas_tecnicas")
    .select(
      "id, nota, nota_cliente, foto_path, foto2_path, visivel_cliente, marcacao_id, criado_por, criado_em, profissionais(nome_apresentado), marcacoes(inicio, servicos(nome))",
    )
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("fichas_tecnicas", error);
  const urls = await assinarFotos(
    bd,
    data.flatMap((f) => [f.foto_path, f.foto2_path].filter((x): x is string => !!x)),
  );
  return data.map((f) => ({
    id: f.id,
    nota: f.nota,
    notaCliente: f.nota_cliente,
    fotoUrls: [f.foto_path, f.foto2_path].flatMap((c) => (c && urls.get(c) ? [urls.get(c)!] : [])),
    visivelCliente: f.visivel_cliente,
    marcacaoId: f.marcacao_id,
    data: f.marcacoes?.inicio ?? f.criado_em,
    servico: f.marcacoes?.servicos?.nome ?? null,
    profissional: f.profissionais?.nome_apresentado ?? null,
    criadoPor: f.criado_por,
  }));
}

export type FotoNova = { dados: ArrayBuffer; tipo: string; extensao: string };

/** Nova entrada do histórico. As fotografias sobem primeiro; se a base de dados recusar, saem. */
export async function criarNotaTecnica(
  bd: ClienteBD,
  d: {
    inquilinoId: string;
    clienteId: string;
    profissionalId: string | null;
    marcacaoId: string | null;
    nota: string | null;
    notaCliente: string | null;
    visivelCliente: boolean;
    fotos: FotoNova[];
    criadoPor: string;
  },
): Promise<true | string> {
  const caminhos: string[] = [];
  for (const foto of d.fotos.slice(0, 2)) {
    const caminho = `${d.inquilinoId}/${d.clienteId}/${crypto.randomUUID()}.${foto.extensao}`;
    const { error } = await bd.storage
      .from(BUCKET_FICHAS)
      .upload(caminho, foto.dados, { contentType: foto.tipo });
    if (error) {
      if (caminhos.length) await bd.storage.from(BUCKET_FICHAS).remove(caminhos);
      return "erro";
    }
    caminhos.push(caminho);
  }
  const { error } = await bd.from("fichas_tecnicas").insert({
    inquilino_id: d.inquilinoId,
    cliente_id: d.clienteId,
    profissional_id: d.profissionalId,
    marcacao_id: d.marcacaoId,
    nota: d.nota,
    nota_cliente: d.notaCliente,
    visivel_cliente: d.visivelCliente,
    foto_path: caminhos[0] ?? null,
    foto2_path: caminhos[1] ?? null,
    criado_por: d.criadoPor,
  });
  if (!error) return true;
  if (caminhos.length) await bd.storage.from(BUCKET_FICHAS).remove(caminhos);
  if (error.message.includes("sem_consentimento_fotos")) return "sem_consentimento_fotos";
  if (error.message.includes("marcacao_invalida")) return "marcacao_invalida";
  if (error.code === "23505") return "marcacao_repetida";
  return "erro";
}

/** Mostrar ou esconder a entrada na área do cliente. */
export async function mudarVisibilidadeNota(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
  visivel: boolean,
): Promise<boolean> {
  const { data, error } = await bd
    .from("fichas_tecnicas")
    .update({ visivel_cliente: visivel })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("id");
  return !error && data.length > 0;
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
    .select("foto_path, foto2_path");
  if (error || data.length === 0) return false;
  const fotos = [data[0]?.foto_path, data[0]?.foto2_path].filter((x): x is string => !!x);
  if (fotos.length) await bd.storage.from(BUCKET_FICHAS).remove(fotos);
  return true;
}

/** A equipa regista que o cliente autorizou as fotografias (o RLS limita aos seus clientes). */
export async function registarConsentimentoFotos(
  bd: ClienteBD,
  inquilinoId: string,
  clienteId: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("clientes")
    .update({ consentimento_fotos: true, consentimento_fotos_em: new Date().toISOString() })
    .eq("inquilino_id", inquilinoId)
    .eq("id", clienteId)
    .select("id");
  return !error && data.length > 0;
}
