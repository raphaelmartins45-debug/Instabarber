import { RegistoBarbearia } from "@/components/admin/registo/registo-barbearia";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { lerCondicoes } from "@/lib/repositorios/comercial/condicoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.registo;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Registar uma barbearia pelo painel (D-189): só os administradores (dono e gestor). */
export default async function NovaBarbearia() {
  await exigirSuperAdmin();
  const condicoes = await lerCondicoes(await criarClienteServidor());
  return (
    <section className="grid max-w-3xl gap-4">
      <h1 className="text-titulo font-extrabold">{t.titulo}</h1>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <RegistoBarbearia precosCent={{ nenhuma: 0, ...condicoes.precosCent }} />
    </section>
  );
}
