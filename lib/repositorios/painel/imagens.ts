import type { ClienteBD } from "@/lib/supabase/tipos";

// Imagens públicas da barbearia (bucket `publico`): fotografia e portfólio do barbeiro, marca.
// O RLS do Storage deixa o gestor escrever na pasta da barbearia e o barbeiro só em
// `<barbearia>/portfolio/<o seu id>/`.

export const BUCKET_PUBLICO = "publico";

export const IMAGEM_PUBLICA = {
  tipos: {
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/png": "png",
    "image/svg+xml": "svg",
  } as Record<string, string>,
  maxBytes: 3 * 1024 * 1024,
};

/** Carrega e devolve o URL público, ou nulo se o Storage recusar. */
export async function carregarImagemPublica(
  bd: ClienteBD,
  pasta: string,
  ficheiro: File,
): Promise<string | null> {
  const extensao = IMAGEM_PUBLICA.tipos[ficheiro.type];
  if (!extensao || ficheiro.size > IMAGEM_PUBLICA.maxBytes) return null;
  const caminho = `${pasta}/${crypto.randomUUID()}.${extensao}`;
  const { error } = await bd.storage
    .from(BUCKET_PUBLICO)
    .upload(caminho, await ficheiro.arrayBuffer(), { contentType: ficheiro.type });
  if (error) return null;
  return bd.storage.from(BUCKET_PUBLICO).getPublicUrl(caminho).data.publicUrl;
}

/** Apaga do Storage a imagem de um URL público deste bucket (ignora URLs de fora). */
export async function removerImagemPublica(bd: ClienteBD, url: string): Promise<void> {
  const marca = `/object/public/${BUCKET_PUBLICO}/`;
  const i = url.indexOf(marca);
  if (i < 0) return;
  await bd.storage.from(BUCKET_PUBLICO).remove([decodeURIComponent(url.slice(i + marca.length))]);
}
