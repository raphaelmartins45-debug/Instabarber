import { eAdministrador } from "@/lib/admin/acesso";
import { lerSuperAdmin } from "@/lib/admin/contexto";
import { documentoDaBarbearia, TIPOS_DOCUMENTO } from "@/lib/documentos/barbearia-pdfs";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Documentos personalizados de uma barbearia (D-181): guia de arranque, guia do barbeiro,
// cartaz do balcão e resumo da conta. Só os administradores com dois fatores; os outros, 404.

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(
  _pedido: Request,
  { params }: { params: Promise<{ id: string; tipo: string }> },
) {
  const quem = await lerSuperAdmin();
  const { id, tipo } = await params;
  const valido = (TIPOS_DOCUMENTO as readonly string[]).includes(tipo) && UUID.test(id);
  if (!quem.aal2 || !eAdministrador(quem.papel) || !valido)
    return new Response(null, { status: 404 });
  const f = await documentoDaBarbearia(
    await criarClienteServidor(),
    id,
    tipo as (typeof TIPOS_DOCUMENTO)[number],
    quem.userId,
  );
  if (!f) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(f.conteudo), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${f.nome}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
