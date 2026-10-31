import { CartaoDemonstracao } from "@/components/admin/comercial/cartao-demonstracao";
import { ModuloVendas } from "@/components/admin/vendas/modulo-vendas";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { paginaPublica } from "@/lib/inquilino/endereco";
import { obterDemonstracao } from "@/lib/repositorios/admin/demonstracao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.vendas;
export const metadata = { title: `${t.modulos.demonstracao} · ${t.titulo}` };

/**
 * A barbearia de demonstração (D-162): só para o dono e o gestor, porque abre na vista de
 * apoio; o comercial vê o aviso para a pedir.
 */
export default async function Demonstracao() {
  const admin = eAdministrador((await exigirEquipaPlataforma()).papel);
  const demo = admin ? await obterDemonstracao(await criarClienteServidor()) : null;
  return (
    <ModuloVendas id="demonstracao">
      {admin ? (
        <CartaoDemonstracao pagina={demo ? await paginaPublica(demo.slug) : null} />
      ) : (
        <p className="text-sm text-muted-foreground">{t.demonstracaoSoAdmin}</p>
      )}
    </ModuloVendas>
  );
}
