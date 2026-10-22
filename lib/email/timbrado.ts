import { textos } from "@/lib/i18n/pt-PT";

// E-mail timbrado (D-102): cabeçalho preto com a logo, corpo claro, assinatura a negrito e rodapé preto
// com o e-mail comercial e o Instagram. Layout em tabelas e estilos em linha, que é o que os clientes
// de e-mail suportam. Todo o texto que vem do visitante passa por escapeHtml.

const COR = {
  tinta: "#12100E",
  ouro: "#F5A623",
  creme: "#F7F5F1",
  texto: "#1B1814",
  suave: "#A9A298",
  linha: "#E4DFD5",
  fundo: "#EDEAE4",
} as const;

const FONTE = "Arial, Helvetica, sans-serif";

export function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type DadosTimbrado = {
  saudacao: string;
  paragrafos: string[];
  /** Caixa de destaque (por exemplo, a referência do pedido). */
  destaque?: { titulo: string; nota?: string };
  paragrafosFinais: string[];
  despedida: string;
  /** Linhas da assinatura, a negrito. */
  assinatura: string[];
  logoUrl: string;
  rodape: { email: string; instagramTexto: string; instagramUrl: string };
};

function paragrafo(texto: string): string {
  return `<p style="margin:0 0 16px 0;font-family:${FONTE};font-size:15px;line-height:1.6;color:${COR.texto};">${escapeHtml(texto)}</p>`;
}

export function emailTimbrado(d: DadosTimbrado): string {
  const destaque = d.destaque
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;"><tr><td style="background:${COR.creme};border-left:3px solid ${COR.ouro};padding:14px 16px;font-family:${FONTE};font-size:15px;line-height:1.5;color:${COR.texto};"><strong>${escapeHtml(d.destaque.titulo)}</strong>${
        d.destaque.nota
          ? `<br><span style="font-size:13px;color:#6A645B;">${escapeHtml(d.destaque.nota)}</span>`
          : ""
      }</td></tr></table>`
    : "";
  const assinatura = d.assinatura
    .map((l) => `<strong>${escapeHtml(l)}</strong>`)
    .join("<br>");
  const { email, instagramTexto, instagramUrl } = d.rodape;
  return `<!doctype html>
<html lang="pt-PT">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(textos.marca.nome)}</title></head>
<body style="margin:0;padding:0;background:${COR.fundo};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${COR.fundo};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
<tr><td style="background:${COR.tinta};padding:24px 32px;border-bottom:3px solid ${COR.ouro};"><img src="${escapeHtml(d.logoUrl)}" width="170" alt="${escapeHtml(textos.marca.nome)}" style="display:block;border:0;outline:none;height:auto;max-width:170px;font-family:${FONTE};font-size:20px;font-weight:bold;color:${COR.ouro};"></td></tr>
<tr><td style="background:#FFFFFF;padding:32px 32px 8px 32px;">
${paragrafo(d.saudacao)}
${d.paragrafos.map(paragrafo).join("\n")}
${destaque}
${d.paragrafosFinais.map(paragrafo).join("\n")}
<p style="margin:24px 0 4px 0;font-family:${FONTE};font-size:15px;line-height:1.6;color:${COR.texto};">${escapeHtml(d.despedida)}</p>
<p style="margin:16px 0 24px 0;font-family:${FONTE};font-size:15px;line-height:1.6;color:${COR.texto};">${assinatura}</p>
</td></tr>
<tr><td style="background:${COR.tinta};padding:20px 32px;font-family:${FONTE};font-size:13px;line-height:1.7;color:${COR.suave};">
<a href="mailto:${escapeHtml(email)}" style="color:${COR.ouro};text-decoration:none;">${escapeHtml(email)}</a><br>
Instagram: <a href="${escapeHtml(instagramUrl)}" style="color:${COR.ouro};text-decoration:none;">${escapeHtml(instagramTexto)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
