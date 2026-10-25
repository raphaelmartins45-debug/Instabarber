import { FormularioConviteEquipa } from "@/components/admin/equipa/formulario-convite-equipa";
import { ListaEquipa } from "@/components/admin/equipa/lista-equipa";
import { exigirDono } from "@/lib/admin/contexto";
import { lerEntradas } from "@/lib/auth/contas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarEquipaPlataforma } from "@/lib/repositorios/admin/equipa";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.gestao.equipa;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Equipa InstaBarber (D-161): só o dono convida, muda o papel e desativa. */
export default async function Equipa() {
  const { userId } = await exigirDono();
  const membros = await listarEquipaPlataforma(await criarClienteServidor());
  // A última entrada vem do Supabase Auth (chave de serviço, só leitura das datas).
  const entradas = await lerEntradas(
    criarClienteServico(),
    membros.map((m) => m.userId),
  );
  return (
    <section className="grid gap-6">
      <h1 className="text-[22px] font-extrabold tracking-tight">{t.titulo}</h1>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <FormularioConviteEquipa />
      <ListaEquipa
        membros={membros.map((m) => ({
          ...m,
          ultimaEntrada: entradas.get(m.userId)?.ultimaEntrada ?? null,
          eu: m.userId === userId,
        }))}
      />
    </section>
  );
}
