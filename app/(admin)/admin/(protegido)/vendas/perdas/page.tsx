import { CalculadoraPerdas } from "@/components/admin/vendas/calculadora-perdas";
import { ModuloVendas } from "@/components/admin/vendas/modulo-vendas";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";

export const metadata = { title: `${textos.vendas.modulos.perdas} · ${textos.vendas.titulo}` };

/** Módulo do Apoio às vendas (D-181), com o regime de IVA da configuração. */
export default function Modulo() {
  return (
    <ModuloVendas id="perdas">
      <CalculadoraPerdas regime={lerRegimeIva(process.env.PRESTADORA_REGIME_IVA)} />
    </ModuloVendas>
  );
}
