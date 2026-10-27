import { lerSuperAdmin } from "@/lib/admin/contexto";
import { pdfDoContrato } from "@/lib/comercial/pdf-contrato";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// PDF do contrato (N.6). A equipa InstaBarber com dois fatores (o RLS só dá ao comercial os
// contratos dos seus leads); os outros recebem 404, como o resto do Admin.

export async function GET(_pedido: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await lerSuperAdmin()).aal2) return new Response(null, { status: 404 });
  const f = await pdfDoContrato(await criarClienteServidor(), (await params).id);
  if (!f) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(f.conteudo), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${f.nome}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
