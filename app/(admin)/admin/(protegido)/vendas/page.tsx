import { CartaoModulo } from "@/components/admin/vendas/cartao-modulo";
import { MODULOS_VENDAS } from "@/components/admin/vendas/modulos";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.vendas;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Visão geral do Apoio às vendas (D-181): os módulos arrumados pelas fases da venda. */
export default function ApoioAsVendas() {
  return (
    <div className="grid gap-6" data-testid="vendas-geral">
      {t.fases.map((f) => (
        <section key={f.titulo} className="grid gap-3" aria-label={f.titulo}>
          <h2 className="rotulo">{f.titulo}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODULOS_VENDAS.filter((m) => (f.modulos as readonly string[]).includes(m.id)).map(
              (m) => (
                <CartaoModulo key={m.id} id={m.id} href={m.href} icone={m.icone} />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
