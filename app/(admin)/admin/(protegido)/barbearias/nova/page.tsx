import { RegistoBarbearia } from "@/components/admin/registo/registo-barbearia";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { dadosDaProposta } from "@/lib/admin/registo-proposta";
import { textos } from "@/lib/i18n/pt-PT";
import { listarCampanhas } from "@/lib/repositorios/comercial/campanhas";
import { lerCondicoes } from "@/lib/repositorios/comercial/condicoes";
import { propostasParaRegisto } from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.registo;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Registar uma barbearia pelo painel (D-189): só os administradores (dono e gestor). */
export default async function NovaBarbearia() {
  await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const [condicoes, campanhas, abertas] = await Promise.all([
    lerCondicoes(bd),
    listarCampanhas(bd),
    propostasParaRegisto(bd),
  ]);
  // Carregar de uma proposta (D-195): o rótulo e os dados que preenchem o formulário.
  const propostas = abertas.map((p) => ({
    id: p.id!,
    numero: p.numero!,
    rotulo: t.opcaoProposta(
      p.numero!,
      p.lead?.nome_barbearia || p.lead?.nome_contacto || "",
      textos.comercial.propostas.estados[p.estado_efetivo ?? ""] ?? "",
    ),
    dados: dadosDaProposta(
      {
        plano: p.plano!,
        periodicidade: p.periodicidade!,
        profissionais: p.profissionais!,
        implementacao: p.implementacao!,
        taxa_migracao_sem_iva: p.taxa_migracao_sem_iva!,
        campanha_id: p.campanha_id,
        dados: p.dados,
      },
      p.lead,
    ),
  }));
  return (
    <section className="grid max-w-3xl gap-4">
      <h1 className="text-titulo font-extrabold">{t.titulo}</h1>
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <RegistoBarbearia
        precosCent={{ nenhuma: 0, ...condicoes.precosCent }}
        campanhas={campanhas}
        propostas={propostas}
      />
    </section>
  );
}
