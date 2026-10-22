// Caixa de correio de teste do Supabase local (Mailpit): os e-mails do Auth chegam aqui.

const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

/** A ligação do último e-mail enviado para `para` (espera até chegar). */
export async function ligacaoDoUltimoEmail(para: string, tentativas = 20): Promise<string> {
  for (let i = 0; i < tentativas; i++) {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${para}"`)}`);
    const { messages } = (await r.json()) as { messages: { ID: string }[] };
    if (messages.length > 0) {
      const m = await (await fetch(`${MAILPIT}/api/v1/message/${messages[0]!.ID}`)).json();
      const href = /href="([^"]*token_hash=[^"]*)"/.exec((m as { HTML: string }).HTML)?.[1];
      if (href) return href.replaceAll("&amp;", "&");
    }
    await new Promise((resolver) => setTimeout(resolver, 500));
  }
  throw new Error(`Nenhum e-mail para ${para}`);
}
