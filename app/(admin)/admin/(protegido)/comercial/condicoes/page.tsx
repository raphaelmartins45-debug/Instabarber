import { FormularioCondicoes } from "@/components/admin/comercial/formulario-condicoes";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { lerCondicoes } from "@/lib/repositorios/comercial/condicoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial.condicoes;
export const metadata = { title: `${t.titulo} · ${textos.comercial.titulo}` };

/** Condições comerciais (D-161): só o dono e o gestor. */
export default async function Condicoes() {
  await exigirSuperAdmin();
  const c = await lerCondicoes(await criarClienteServidor());
  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-bold">{t.titulo}</h2>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <FormularioCondicoes
        inicial={{
          descontosAtivos: c.descontosAtivos,
          descontoMaxMensalidade: c.descontoMaxMensalidade,
          taxaAtiva: c.taxaAtiva,
          taxaBase: textoDeCentimos(c.taxaBaseCent),
          descontoMaxTaxa: c.descontoMaxTaxa,
        }}
      />
    </div>
  );
}
