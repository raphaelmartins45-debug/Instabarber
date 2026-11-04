import { ComunicadosEquipa } from "@/components/admin/painel/comunicados-equipa";
import { CartaoLead } from "@/components/admin/comercial/cartao-lead";
import { DemosMarcadas } from "@/components/admin/comercial/demos-marcadas";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { hojeIso } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { colunaDoFunil } from "@/lib/regras/comercial";
import { ganhosPorLead } from "@/lib/repositorios/comercial/contratos";
import { listarLeads, potencialPorLead } from "@/lib/repositorios/comercial/leads";
import { ESTADOS_FUNIL } from "@/lib/validacao/comercial";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/**
 * Funil (N.3, D-211): uma coluna por estado, com o número de leads e o valor potencial por mês; o
 * pós-venda calcula-se pelo contrato. Por cima, as demonstrações marcadas.
 */
export default async function Funil() {
  await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const [leads, potencial, ganhos] = await Promise.all([
    listarLeads(bd),
    potencialPorLead(bd),
    ganhosPorLead(bd),
  ]);
  const hoje = hojeIso();
  return (
    <div className="grid gap-5">
      <ComunicadosEquipa />
      <DemosMarcadas leads={leads} />
      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        <div className="grid gap-4 md:grid-flow-col md:auto-cols-[minmax(220px,1fr)]">
          {ESTADOS_FUNIL.map((estado) => {
            const daqui = leads.filter(
              (l) => colunaDoFunil(l.estado, ganhos.get(l.id), hoje) === estado,
            );
            const soma = daqui.reduce(
              (s, l) => s + (potencial.has(l.id) ? centimosDeNumeric(potencial.get(l.id)!) : 0),
              0,
            );
            return (
              <section
                key={estado}
                className="grid content-start gap-2"
                data-testid={`coluna-${estado}`}
              >
                <header className="grid gap-0.5">
                  <h2 className="text-sm font-semibold">{t.estados[estado]}</h2>
                  <p className="numero text-xs text-muted-foreground">
                    {t.funil.leads(daqui.length)}
                    {soma > 0 ? ` · ${formatarDinheiro(soma)}` : ""}
                  </p>
                </header>
                {daqui.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-3 text-xs text-terciario">
                    {t.funil.vazio}
                  </p>
                ) : (
                  daqui.map((l) => (
                    <CartaoLead key={l.id} lead={l} hoje={hoje} potencial={potencial.get(l.id)} />
                  ))
                )}
              </section>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-terciario">{t.funil.potencial}</p>
      </div>
    </div>
  );
}
