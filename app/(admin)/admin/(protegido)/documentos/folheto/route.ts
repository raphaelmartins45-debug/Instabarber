import { lerSuperAdmin } from "@/lib/admin/contexto";
import { assinaturaDe } from "@/lib/documentos/barbearia";
import { DOMINIO } from "@/lib/email/enderecos";
import { textos } from "@/lib/i18n/pt-PT";
import { gerarFolheto } from "@/lib/pdf/folheto";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Folheto da visita (D-181): com o nome, o telefone e o e-mail do registo de quem o gera. Toda
// a equipa InstaBarber com dois fatores; os outros, 404.

export async function GET() {
  const quem = await lerSuperAdmin();
  if (!quem.aal2) return new Response(null, { status: 404 });
  const contacto = await assinaturaDe(await criarClienteServidor(), quem.userId);
  const pdf = gerarFolheto({
    regime: lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
    site: `https://${DOMINIO}`,
    contacto: { ...contacto, email: contacto.email ?? quem.email },
  });
  return new Response(pdf.output("arraybuffer"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${textos.documentos.folheto.nomeFicheiro}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
