import { BibliotecaMensagens } from "@/components/admin/vendas/biblioteca-mensagens";
import { ModuloVendas } from "@/components/admin/vendas/modulo-vendas";
import { textos } from "@/lib/i18n/pt-PT";

export const metadata = { title: `${textos.vendas.modulos.mensagens} · ${textos.vendas.titulo}` };

/** Um módulo do Apoio às vendas (D-181). */
export default function Modulo() {
  return (
    <ModuloVendas id="mensagens" largo>
      <BibliotecaMensagens />
    </ModuloVendas>
  );
}
