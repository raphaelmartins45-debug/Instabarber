import { GrelhaFuncionalidades } from "@/components/admin/grelha-funcionalidades";
import { Button } from "@/components/ui/button";
import { dadosDaGrelha } from "@/lib/admin/dados-grelha";
import { textos } from "@/lib/i18n/pt-PT";
import { listarBarbearias, obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.funcionalidades;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Grelha de funcionalidades com o seletor de barbearia no topo (E.1). */
export default async function Funcionalidades({
  searchParams,
}: {
  searchParams: Promise<{ barbearia?: string }>;
}) {
  const { barbearia } = await searchParams;
  const bd = await criarClienteServidor();
  const lista = await listarBarbearias(bd);
  const escolhida =
    barbearia && /^[0-9a-f-]{36}$/.test(barbearia) ? await obterBarbearia(bd, barbearia) : null;
  return (
    <section className="grid gap-4">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <form className="flex flex-wrap items-end gap-3">
        <label className="grid flex-1 gap-1.5 text-sm">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {t.barbearia}
          </span>
          <select
            name="barbearia"
            defaultValue={escolhida?.id ?? ""}
            className="h-11 rounded-md border bg-card px-3"
          >
            <option value="" disabled>
              {t.escolher}
            </option>
            {lista.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" className="h-11">
          {textos.admin.barbearias.abrir}
        </Button>
      </form>
      {escolhida ? (
        <GrelhaFuncionalidades key={escolhida.id} {...await dadosDaGrelha(bd, escolhida)} />
      ) : null}
    </section>
  );
}
