import { lerSuperAdmin } from "@/lib/admin/contexto";
import { obterContrato, urlPdfAssinado } from "@/lib/repositorios/comercial/contratos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// PDF assinado (N.6): redireciona para um URL temporário do bucket privado. Só o super_admin com
// dois fatores; os outros recebem 404.

export async function GET(_pedido: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await lerSuperAdmin()).aal2) return new Response(null, { status: 404 });
  const bd = await criarClienteServidor();
  const c = await obterContrato(bd, (await params).id);
  const url = c?.pdf_assinado_path ? await urlPdfAssinado(bd, c.pdf_assinado_path) : null;
  if (!url) return new Response(null, { status: 404 });
  return Response.redirect(url, 302);
}
