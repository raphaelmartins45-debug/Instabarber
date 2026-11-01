import { lerSuperAdmin } from "@/lib/admin/contexto";
import { assinaturaDe } from "@/lib/documentos/barbearia";
import { DOMINIO } from "@/lib/email/enderecos";
import { textos } from "@/lib/i18n/pt-PT";
import { gerarFolheto } from "@/lib/pdf/folheto";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Folheto da visita (D-181): assinado por quem o gera, com o nome, o cargo, o WhatsApp e o
// e-mail do registo (D-184). Toda a equipa InstaBarber com dois fatores; os outros, 404.

export async function GET(pedido: Request) {
  const quem = await lerSuperAdmin();
  if (!quem.aal2) return new Response(null, { status: 404 });
  // Preto (por omissão) ou branco, para imprimir em casa sem gastar tinta (D-185).
  const tema = new URL(pedido.url).searchParams.get("tema") === "branco" ? "branco" : "preto";
  const pdf = gerarFolheto({
    tema,
    regime: lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
    site: `https://${DOMINIO}`,
    contacto: await assinaturaDe(await criarClienteServidor(), quem.userId),
  });
  return new Response(pdf.output("arraybuffer"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${textos.documentos.folheto.nomeFicheiro(tema)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
