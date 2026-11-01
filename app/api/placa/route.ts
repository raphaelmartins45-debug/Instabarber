import { pdfPlaca } from "@/lib/documentos/placa";
import { obterContextoEquipa } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaPlaca } from "@/lib/validacao/placa";

// O PDF da placa do balcão (D-185), com o modelo e os textos que o gestor escolheu. Só o gestor
// e só com a página pública ativa; os textos validam-se com o mesmo esquema do formulário.

export async function GET(pedido: Request) {
  const contexto = await obterContextoEquipa();
  const grelha = await lerGrelha(contexto.barbearia.id);
  if (!contexto.eGestor || !grelha.ativas.has("pagina_publica"))
    return new Response(null, { status: 404 });
  const escolha = esquemaPlaca.safeParse(Object.fromEntries(new URL(pedido.url).searchParams));
  if (!escolha.success) return new Response(null, { status: 400 });
  const placa = await pdfPlaca(await criarClienteServidor(), contexto.barbearia.id, escolha.data);
  return new Response(new Uint8Array(placa.conteudo), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${placa.nome}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
