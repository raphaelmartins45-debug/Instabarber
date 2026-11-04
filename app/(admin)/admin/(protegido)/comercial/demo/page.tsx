import { ConfigurarDemonstracao } from "@/components/admin/vendas/configurar-demonstracao";
import { ModuloVendas } from "@/components/admin/vendas/modulo-vendas";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { obterDemonstracao } from "@/lib/repositorios/admin/demonstracao";
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
  const demo = await obterDemonstracao(await criarClienteServidor());
  return (
    <ModuloVendas id="demonstracao">
      <ConfigurarDemonstracao demo={demo} />
    </ModuloVendas>
  );
}
