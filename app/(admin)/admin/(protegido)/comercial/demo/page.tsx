import { ConfigurarDemonstracao } from "@/components/admin/vendas/configurar-demonstracao";
import { ModuloVendas } from "@/components/admin/vendas/modulo-vendas";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { obterDemonstracao } from "@/lib/repositorios/admin/demonstracao";
import { listarLeads } from "@/lib/repositorios/comercial/leads";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata = {
  title: `${textos.comercial.separadores.demo} · ${textos.comercial.titulo}`,
};

/**
 * A demonstração (D-162, D-207): toda a equipa da InstaBarber prepara a barbearia de
 * demonstração para a reunião e abre as vistas em instabarber.pt/demo.
 */
export default async function Demonstracao() {
  await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const [demo, todos] = await Promise.all([obterDemonstracao(bd), listarLeads(bd)]);
  // Os leads ainda em aberto, para escolher o da apresentação (D-209).
  const leads = todos
    .filter((l) => l.estado !== "ganho" && l.estado !== "perdido")
    .map((l) => ({
      id: l.id,
      barbearia: l.nome_barbearia ?? l.nome_contacto,
      contacto: l.nome_contacto,
      cidade: l.cidade,
    }));
  return (
    <ModuloVendas id="demonstracao">
      <ConfigurarDemonstracao demo={demo} leads={leads} />
    </ModuloVendas>
  );
}
