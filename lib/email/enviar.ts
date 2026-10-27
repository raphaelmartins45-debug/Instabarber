import "server-only";
import { Resend } from "resend";
import { variavel } from "@/lib/configuracao/ambiente";

export type Email = {
  de: string;
  para: string;
  assunto: string;
  texto: string;
  /** Versão HTML (e-mail timbrado). O texto simples segue sempre como alternativa. */
  html?: string;
  responderPara?: string;
  /** Ficheiros anexos: texto (o .ics da marcação) ou binário (o PDF do guia, D-181). */
  anexos?: { nome: string; conteudo: string | Buffer }[];
};

/**
 * Monta e envia um e-mail transacional pelo Resend. Devolve false se o envio falhar, incluindo
 * por falta de uma variável de ambiente ao montar a mensagem (nunca lança).
 */
export async function enviarEmail(montar: () => Email): Promise<boolean> {
  try {
    const email = montar();
    const resend = new Resend(variavel("RESEND_API_KEY"));
    const { error } = await resend.emails.send({
      from: email.de,
      to: email.para,
      subject: email.assunto,
      text: email.texto,
      ...(email.html ? { html: email.html } : {}),
      ...(email.responderPara ? { replyTo: email.responderPara } : {}),
      ...(email.anexos
        ? {
            attachments: email.anexos.map((a) => ({
              filename: a.nome,
              content:
                typeof a.conteudo === "string" ? Buffer.from(a.conteudo, "utf-8") : a.conteudo,
            })),
          }
        : {}),
    });
    if (error) {
      console.error("email_falhou", error.name);
      return false;
    }
    return true;
  } catch (erro) {
    console.error("email_falhou", erro instanceof Error ? erro.message : "desconhecido");
    return false;
  }
}
