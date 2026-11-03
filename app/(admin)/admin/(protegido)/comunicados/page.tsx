import { FormularioComunicado } from "@/components/admin/gestao/formulario-comunicado";
import { ListaComunicados } from "@/components/admin/gestao/lista-comunicados";
import { hojeIso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { barbeariasParaComunicados, listarComunicados } from "@/lib/repositorios/admin/comunicados";
import { listarEquipaPlataforma } from "@/lib/repositorios/admin/equipa";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.gestao.comunicados;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Comunicados aos gestores das barbearias (sugestão D), D-160. */
export default async function Comunicados() {
  const bd = await criarClienteServidor();
  const [comunicados, barbearias, equipa] = await Promise.all([
    listarComunicados(bd),
    barbeariasParaComunicados(bd),
    listarEquipaPlataforma(bd),
  ]);
  // Comerciais e gestores ativos, para escolher uma pessoa (D-191).
  const pessoas = (papel: string) =>
    Object.fromEntries(
      equipa.filter((m) => m.papel === papel && m.ativo).map((m) => [m.userId, m.nome]),
    );
  return (
    <section className="grid gap-6">
      <h1 className="text-titulo font-extrabold tracking-tight">{t.titulo}</h1>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <FormularioComunicado
        hoje={hojeIso()}
        barbearias={Object.fromEntries(barbearias.map((b) => [b.id, b.nome]))}
        comerciais={pessoas("comercial")}
        gestores={pessoas("gestor_plataforma")}
      />
      <ListaComunicados
        comunicados={comunicados}
        barbearias={barbearias}
        equipa={equipa}
        agora={new Date()}
      />
    </section>
  );
}
