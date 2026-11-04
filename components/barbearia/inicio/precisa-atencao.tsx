import { PedidosAcesso } from "@/components/barbearia/pedidos-acesso";
import { textos } from "@/lib/i18n/pt-PT";
import type { LinhaRadar } from "@/lib/painel/radar";
import { ClientesContactar } from "./clientes-contactar";
import { ContasPendentes } from "./contas-pendentes";

const t = textos.inicio;

/**
 * O que precisa de atenção no Início (D-203): pedidos de acesso, contas por pagar e clientes a
 * contactar, cada um só quando há alguma coisa; sem nada, «Tudo em dia».
 */
export function PrecisaAtencao({
  pedidos,
  barbearia,
  contas,
  contactar,
  mensagens,
  pagina,
}: {
  pedidos: Parameters<typeof PedidosAcesso>[0]["pedidos"];
  barbearia: string;
  contas: Parameters<typeof ContasPendentes>[0]["contas"];
  contactar: LinhaRadar[];
  mensagens: boolean;
  pagina: string;
}) {
  const nada = pedidos.length === 0 && contas.length === 0 && contactar.length === 0;
  return (
    <aside className="cartao grid content-start gap-3 rounded-xl p-4" aria-labelledby="atencao">
      <h2 id="atencao" className="text-sm font-bold">
        {t.atencao}
      </h2>
      {nada ? <p className="text-sm text-muted-foreground">{t.tudoEmDia}</p> : null}
      {pedidos.length ? <PedidosAcesso pedidos={pedidos} barbearia={barbearia} /> : null}
      {contas.length ? (
        <section className="grid gap-2" aria-labelledby="contas">
          <h3 id="contas" className="rotulo">
            {t.contasTitulo}
          </h3>
          <ContasPendentes contas={contas} />
        </section>
      ) : null}
      {contactar.length ? (
        <section className="grid gap-2" aria-labelledby="contactar">
          <h3 id="contactar" className="rotulo">
            {t.contactarTitulo}
          </h3>
          <ClientesContactar
            linhas={contactar}
            mensagens={mensagens}
            pagina={pagina}
            assinatura={barbearia}
            base="/app/clientes"
          />
        </section>
      ) : null}
    </aside>
  );
}
