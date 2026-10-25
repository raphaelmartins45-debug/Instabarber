import { FormularioComunicado } from "@/components/admin/gestao/formulario-comunicado";
import { ListaComunicados } from "@/components/admin/gestao/lista-comunicados";
import { hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { barbeariasParaComunicados, listarComunicados } from "@/lib/repositorios/admin/comunicados";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.gestao.comunicados;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Comunicados aos gestores das barbearias (sugestão D), D-160. */
export default async function Comunicados() {
  const bd = await criarClienteServidor();
  const [comunicados, barbearias] = await Promise.all([
    listarComunicados(bd),
    barbeariasParaComunicados(bd),
  ]);
  return (
    <section className="grid gap-6">
      <h1 className="text-[22px] font-extrabold tracking-tight">{t.titulo}</h1>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <FormularioComunicado
        hoje={hojeIso()}
        barbearias={Object.fromEntries(barbearias.map((b) => [b.id, b.nome]))}
      />
      <ListaComunicados comunicados={comunicados} barbearias={barbearias} agora={new Date()} />
    </section>
  );
}
