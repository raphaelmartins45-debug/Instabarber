import { textos } from "@/lib/i18n/pt-PT";

// E-mail timbrado (D-102, D-184): cabeçalho preto com a logo, corpo claro, assinatura e rodapé
// preto com o e-mail de quem responde e o Instagram. O corpo é uma lista de blocos (parágrafo,
// lista, botão, destaque, pares rótulo-valor, subtítulo); dos mesmos blocos saem o HTML e o texto
// simples, para as duas versões dizerem sempre o mesmo. Layout em tabelas e estilos em linha, que
// é o que os clientes de e-mail suportam. Todo o texto passa por escapeHtml.

const COR = {
  tinta: "#12100E",
  ouro: "#F5A623",
  creme: "#F7F5F1",
  texto: "#1B1814",
  secundario: "#6A645B",
  suave: "#A9A298",
  ligacao: "#945C00",
  fundo: "#EDEAE4",
} as const;

const FONTE = "Arial, Helvetica, sans-serif";

// O Gmail (sobretudo no iPhone) inverte as cores em modo escuro e deixava a faixa preta clara, com a logo ilegível.
// Atributo bgcolor mais um gradiente da mesma cor é o truque que o impede de inverter: o desenho fica igual nos dois modos.
const fixo = (cor: string) =>
  `bgcolor="${cor}" style="background-color:${cor};background-image:linear-gradient(${cor},${cor});`;

export function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Um bloco do corpo: um parágrafo (texto) ou uma das peças com forma própria. */
export type BlocoEmail =
  | string
  | { titulo: string }
  | { lista: readonly string[]; numerada?: boolean }
  | { botao: string; url: string; nota?: string }
  | { destaque: string; nota?: string }
  | { pares: readonly (readonly [string, string])[] };

export type CorpoEmail = {
  /** Vazia quando o texto já a traz (o lembrete que o operador reviu). */
  saudacao: string;
  corpo: readonly BlocoEmail[];
  despedida: string;
  /** A primeira linha a negrito (o nome); as outras em cinzento-escuro (D-184). */
  assinatura: readonly string[];
};

export type DadosTimbrado = CorpoEmail & {
  logoUrl: string;
  iconeEmailUrl: string;
  iconeInstagramUrl: string;
  rodape: { email: string; instagramTexto: string; instagramUrl: string };
};

const estiloTexto = `font-family:${FONTE};font-size:15px;line-height:1.6;color:${COR.texto};`;
const p = (html: string, margem = "0 0 16px 0") =>
  `<p style="margin:${margem};${estiloTexto}">${html}</p>`;
const ligacao = (url: string, texto = url) =>
  `<a href="${escapeHtml(url)}" style="color:${COR.ligacao};text-decoration:underline;word-break:break-all;">${escapeHtml(texto)}</a>`;

function blocoHtml(b: BlocoEmail): string {
  if (typeof b === "string") return p(escapeHtml(b));
  if ("titulo" in b) return p(`<strong>${escapeHtml(b.titulo)}</strong>`, "24px 0 8px 0");
  if ("lista" in b) {
    const tag = b.numerada ? "ol" : "ul";
    const itens = b.lista
      .map((i) => `<li style="margin:0 0 8px 0;${estiloTexto}">${escapeHtml(i)}</li>`)
      .join("");
    return `<${tag} style="margin:0 0 16px 0;padding:0 0 0 22px;">${itens}</${tag}>`;
  }
  if ("botao" in b)
    return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 12px 0;"><tr><td ${fixo(COR.ouro)}border-radius:6px;"><a href="${escapeHtml(b.url)}" style="display:inline-block;padding:13px 24px;font-family:${FONTE};font-size:15px;font-weight:bold;line-height:1.2;color:${COR.tinta};text-decoration:none;border-radius:6px;">${escapeHtml(b.botao)}</a></td></tr></table>
<p style="margin:0 0 20px 0;font-family:${FONTE};font-size:13px;line-height:1.5;color:${COR.secundario};">${
      b.nota ? `${escapeHtml(b.nota)} ` : ""
    }${escapeHtml(textos.marca.emailBotaoAlternativa)} ${ligacao(b.url)}</p>`;
  if ("destaque" in b)
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;"><tr><td ${fixo(COR.creme)}border-left:3px solid ${COR.ouro};padding:14px 16px;${estiloTexto}"><strong>${escapeHtml(b.destaque)}</strong>${
      b.nota
        ? `<br><span style="font-size:13px;color:${COR.secundario};">${escapeHtml(b.nota)}</span>`
        : ""
    }</td></tr></table>`;
  const linhas = b.pares
    .map(
      ([rotulo, valor]) =>
        `<tr><td valign="top" style="padding:6px 16px 6px 0;font-family:${FONTE};font-size:13px;line-height:1.5;color:${COR.secundario};white-space:nowrap;">${escapeHtml(rotulo)}</td><td valign="top" style="padding:6px 0;font-family:${FONTE};font-size:15px;line-height:1.5;color:${COR.texto};">${
          /^https?:\/\//.test(valor) ? ligacao(valor) : `<strong>${escapeHtml(valor)}</strong>`
        }</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;">${linhas}</table>`;
}

function blocoTexto(b: BlocoEmail): string {
  if (typeof b === "string") return b;
  if ("titulo" in b) return b.titulo;
  if ("lista" in b)
    return b.lista.map((i, n) => (b.numerada ? `${n + 1}. ${i}` : `- ${i}`)).join("\n");
  if ("botao" in b) return [`${b.botao}: ${b.url}`, ...(b.nota ? [b.nota] : [])].join("\n");
  if ("destaque" in b) return [b.destaque, ...(b.nota ? [b.nota] : [])].join("\n");
  return b.pares.map(([rotulo, valor]) => `${rotulo}: ${valor}`).join("\n");
}

/** A versão em texto simples, dos mesmos blocos do HTML. */
export function textoDoEmail(d: CorpoEmail, rodape?: string): string {
  return [
    d.saudacao,
    ...d.corpo.map(blocoTexto),
    d.despedida,
    d.assinatura.join("\n"),
    rodape ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function emailTimbrado(d: DadosTimbrado): string {
  const [nome = "", ...outras] = d.assinatura;
  const assinatura = [
    `<strong style="color:${COR.tinta};">${escapeHtml(nome)}</strong>`,
    ...outras.map((l) => `<span style="color:${COR.secundario};">${escapeHtml(l)}</span>`),
  ].join("<br>");
  const { email, instagramTexto, instagramUrl } = d.rodape;
  return `<!doctype html>
<html lang="pt-PT">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><style>:root{color-scheme:light only;supported-color-schemes:light only;}</style><title>${escapeHtml(textos.marca.nome)}</title></head>
<body style="margin:0;padding:0;background:${COR.fundo};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${COR.fundo};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
<tr><td ${fixo(COR.tinta)}padding:24px 32px;border-bottom:3px solid ${COR.ouro};"><img src="${escapeHtml(d.logoUrl)}" width="170" alt="${escapeHtml(textos.marca.nome)}" style="display:block;border:0;outline:none;height:auto;max-width:170px;font-family:${FONTE};font-size:20px;font-weight:bold;color:${COR.ouro};"></td></tr>
<tr><td ${fixo("#FFFFFF")}padding:32px 32px 8px 32px;">
${d.saudacao ? p(escapeHtml(d.saudacao)) : ""}
${d.corpo.map(blocoHtml).join("\n")}
${d.despedida ? p(escapeHtml(d.despedida), "24px 0 4px 0") : ""}
${nome ? `<p style="margin:12px 0 24px 0;${estiloTexto}">${assinatura}</p>` : ""}
</td></tr>
<tr><td ${fixo(COR.tinta)}padding:20px 32px;font-family:${FONTE};font-size:13px;line-height:1.7;color:${COR.suave};">
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
<tr><td width="28" valign="middle" style="padding:0 0 8px 0;"><img src="${escapeHtml(d.iconeEmailUrl)}" width="18" height="18" alt="" style="display:block;border:0;"></td><td valign="middle" style="padding:0 0 8px 0;font-family:${FONTE};font-size:14px;line-height:18px;"><a href="mailto:${escapeHtml(email)}" style="color:${COR.ouro};text-decoration:none;">${escapeHtml(email)}</a></td></tr>
<tr><td width="28" valign="middle" style="padding:0;"><img src="${escapeHtml(d.iconeInstagramUrl)}" width="18" height="18" alt="" style="display:block;border:0;"></td><td valign="middle" style="padding:0;font-family:${FONTE};font-size:14px;line-height:18px;"><a href="${escapeHtml(instagramUrl)}" style="color:${COR.ouro};text-decoration:none;">${escapeHtml(instagramTexto)}</a></td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
