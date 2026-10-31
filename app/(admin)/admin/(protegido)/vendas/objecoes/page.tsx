import { Objecoes } from "@/components/admin/vendas/objecoes";
import { ModuloVendas } from "@/components/admin/vendas/modulo-vendas";
import { textos } from "@/lib/i18n/pt-PT";

export const metadata = { title: `${textos.vendas.modulos.objecoes} · ${textos.vendas.titulo}` };

/** Um módulo do Apoio às vendas (D-181). */
export default function Modulo() {
  return (
    <ModuloVendas id="objecoes">
      <Objecoes />
    </ModuloVendas>
  );
}
