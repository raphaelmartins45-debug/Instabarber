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
  /** Ficheiros anexos (por exemplo, o .ics da marcação). */
  anexos?: { nome: string; conteudo: string }[];
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
              content: Buffer.from(a.conteudo, "utf-8"),
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
