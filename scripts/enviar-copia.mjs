// Envia uma cópia cifrada da produção (scripts/copia-api.py) para geral@instabarber.pt, para o
// dono a guardar no Drive, pasta «InstaBarber · Cópias de segurança» (D-169). Só cópias cifradas
// e verificadas (sha256sum -c SHA256SUMS). A palavra-passe nunca vai no e-mail.
// Uso, na raiz do repositório e com o .env.local carregado:
//   node scripts/enviar-copia.mjs copias/instabarber-copia-<data>.tar.gz.gpg "motivo"
import { readFileSync } from "node:fs";
import { Resend } from "resend";

const [ficheiro, motivo = "cópia semanal"] = process.argv.slice(2);
if (!ficheiro?.endsWith(".gpg")) {
  console.error("Indique o ficheiro .gpg da cópia.");
  process.exit(2);
}
const nome = ficheiro.split("/").pop();
const r = await new Resend(process.env.RESEND_API_KEY).emails.send({
  from: process.env.EMAIL_REMETENTE,
  to: "geral@instabarber.pt",
  subject: `Cópia de segurança da produção ${nome}`,
  text: `Cópia cifrada da produção (${motivo}), verificada com SHA256SUMS. Guarde-a na pasta das cópias no Drive. A palavra-passe é a de sempre.\n\nInstaBarber · Performa LAB`,
  attachments: [{ filename: nome, content: readFileSync(ficheiro) }],
});
console.log(r.error ? `ERRO ${JSON.stringify(r.error)}` : `enviado ${r.data.id}`);
