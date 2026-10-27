import { textos } from "@/lib/i18n/pt-PT";
import { listarPromocoes } from "@/lib/repositorios/painel/promocoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { Promocoes } from "./promocoes";

/** Promoções da página pública (E.6): o que aparece no bloco «Promoções» enquanto estão ativas. */
export async function SeccaoPromocoes({ inquilinoId }: { inquilinoId: string }) {
  const promocoes = await listarPromocoes(await criarClienteServidor(), inquilinoId);
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">{textos.sistema.promocoes.ajuda}</p>
      <Promocoes promocoes={promocoes} />
    </div>
  );
}
