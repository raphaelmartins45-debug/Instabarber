import { CartaoCampanha } from "@/components/admin/comercial/cartao-campanha";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { listarCampanhas } from "@/lib/repositorios/comercial/campanhas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial.campanhas;
export const metadata = { title: `${t.titulo} · ${textos.comercial.titulo}` };

/** Campanhas comerciais (D-190): só o dono e o gestor ligam, datam e escrevem o texto. */
export default async function Campanhas() {
  await exigirSuperAdmin();
  const campanhas = await listarCampanhas(await criarClienteServidor());
  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-bold">{t.titulo}</h2>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {campanhas.map((c) => (
          <CartaoCampanha key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
