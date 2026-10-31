import { GuiaoVisita } from "@/components/admin/vendas/guiao-visita";
import { ModuloVendas } from "@/components/admin/vendas/modulo-vendas";
import { textos } from "@/lib/i18n/pt-PT";

export const metadata = { title: `${textos.vendas.modulos.visita} · ${textos.vendas.titulo}` };

/** Um módulo do Apoio às vendas (D-181). */
export default function Modulo() {
  return (
    <ModuloVendas id="visita">
      <GuiaoVisita />
    </ModuloVendas>
  );
}
