import type { ClienteBD } from "@/lib/supabase/tipos";

// Imagens do formulário de adesão, no bucket privado `comercial` (C.7). O URL assinado é
// criado com a chave de serviço; a leitura é do super_admin (política storage_comercial).

export const BUCKET_ADESOES = "comercial";

/** Token do URL assinado de carregamento, ou nulo se o Storage falhar. */
export async function criarUrlCarregamento(
  servico: ClienteBD,
  caminho: string,
): Promise<string | null> {
  const { data, error } = await servico.storage
    .from(BUCKET_ADESOES)
    .createSignedUploadUrl(caminho, { upsert: true });
  return error ? null : data.token;
}

/** URL temporário (10 minutos) para o administrador ver uma imagem do pedido. */
export async function urlTemporario(bd: ClienteBD, caminho: string): Promise<string | null> {
  const { data } = await bd.storage.from(BUCKET_ADESOES).createSignedUrl(caminho, 600);
  return data?.signedUrl ?? null;
}

/** Copia uma imagem aprovada para o bucket público da barbearia e devolve o URL público. */
export async function publicarImagem(
  bd: ClienteBD,
  origem: string,
  destino: string,
): Promise<string | null> {
  const { data: ficheiro, error } = await bd.storage.from(BUCKET_ADESOES).download(origem);
  if (error || !ficheiro) return null;
  const { error: erroCarregar } = await bd.storage
    .from("publico")
    .upload(destino, ficheiro, { upsert: true, contentType: ficheiro.type || undefined });
  if (erroCarregar) return null;
  return bd.storage.from("publico").getPublicUrl(destino).data.publicUrl;
}
