// Tradução dos serviços pelo DeepL (D-176): o nome e a descrição do serviço, de português para
// inglês e francês, para o gestor rever antes de guardar. Nunca dados de clientes. Funções puras
// para montar o pedido e ler a resposta; o envio HTTP recebe o `fetch`.

export type LinguaDestino = "en" | "fr";

/** Códigos do DeepL: inglês britânico (mais próximo do uso na Europa) e francês. */
const DESTINO: Record<LinguaDestino, string> = { en: "EN-GB", fr: "FR" };

/** As chaves do plano gratuito acabam em «:fx» e usam outro endereço. */
export function enderecoDeepl(chave: string): string {
  return chave.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
}

export function pedidoDeepl(
  chave: string,
  textos: string[],
  para: LinguaDestino,
): { url: string; init: RequestInit } {
  return {
    url: enderecoDeepl(chave),
    init: {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: textos, source_lang: "PT", target_lang: DESTINO[para] }),
    },
  };
}

/** Os textos traduzidos, pela ordem do pedido; null se a resposta não tiver a forma esperada. */
export function lerRespostaDeepl(json: unknown, quantos: number): string[] | null {
  const lista = (json as { translations?: { text?: unknown }[] } | null)?.translations;
  if (!Array.isArray(lista) || lista.length !== quantos) return null;
  const textos = lista.map((t) => t.text);
  return textos.every((t): t is string => typeof t === "string") ? textos : null;
}

/** Traduz uma lista de textos (vazios ficam vazios, sem ir ao DeepL). */
export async function traduzirDeepl(
  chave: string,
  textos: string[],
  para: LinguaDestino,
  enviar: typeof fetch = fetch,
): Promise<string[] | null> {
  const comTexto = textos.map((t, i) => ({ t: t.trim(), i })).filter((x) => x.t);
  if (comTexto.length === 0) return textos.map(() => "");
  const { url, init } = pedidoDeepl(
    chave,
    comTexto.map((x) => x.t),
    para,
  );
  try {
    const r = await enviar(url, init);
    if (!r.ok) return null;
    const traduzidos = lerRespostaDeepl(await r.json(), comTexto.length);
    if (!traduzidos) return null;
    const resultado = textos.map(() => "");
    comTexto.forEach((x, k) => (resultado[x.i] = traduzidos[k]!));
    return resultado;
  } catch {
    return null;
  }
}
