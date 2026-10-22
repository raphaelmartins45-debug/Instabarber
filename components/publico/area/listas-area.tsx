import type { ReactNode } from "react";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { MeuPlano, MinhaEncomenda, MinhaVisita } from "@/lib/repositorios/minha-area";

/** Um cartão da área de cliente com título. */
export function SeccaoArea({
  titulo,
  children,
  testId,
}: {
  titulo: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section className="grid gap-2 rounded-2xl border bg-card p-4" data-testid={testId}>
      <h2 className="text-[15px] font-bold">{titulo}</h2>
      {children}
    </section>
  );
}

const lista = "grid gap-1 text-sm";

/** Histórico, plano do clube e encomendas da loja (E.4). */
export function ListasArea({
  t,
  visitas,
  planos,
  encomendas,
  servico,
  barbeiro,
}: {
  t: TextosPublicos;
  visitas: MinhaVisita[];
  planos: MeuPlano[] | null;
  encomendas: MinhaEncomenda[] | null;
  servico: (id: string) => string;
  barbeiro: (id: string | null) => string;
}) {
  return (
    <>
      <SeccaoArea titulo={t.area.historico} testId="historico">
        {visitas.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.area.semHistorico}</p>
        ) : (
          <ul className={lista}>
            {visitas.map((v) => (
              <li key={v.id} className="flex justify-between gap-2">
                <span>
                  {dataCurta(v.data)} · {servico(v.servicoId)}
                  {v.profissionalId ? ` · ${barbeiro(v.profissionalId)}` : ""}
                </span>
                <span className="tabular-nums">{formatarDinheiro(v.valorCent)}</span>
              </li>
            ))}
          </ul>
        )}
      </SeccaoArea>
      {planos?.length ? (
        <SeccaoArea titulo={t.area.clube}>
          {planos.map((p) => (
            <div key={p.clube} className={lista}>
              <p className="font-semibold">{p.clube}</p>
              <p className="text-muted-foreground">
                {t.area.renova(dataCurta(`${p.proximaRenovacao}T12:00:00Z`))}
              </p>
              {p.creditos.map((c) => (
                <p key={c.servicoId}>
                  {servico(c.servicoId)}: {t.area.consumo(c.usados, c.quantidade)}
                </p>
              ))}
            </div>
          ))}
        </SeccaoArea>
      ) : null}
      {encomendas?.length ? (
        <SeccaoArea titulo={t.area.encomendas}>
          <ul className={lista}>
            {encomendas.map((e) => (
              <li key={e.id} className="flex justify-between gap-2">
                <span>
                  #{e.numero} · {dataCurta(e.criadoEm)} · {t.area.estados[e.estado] ?? e.estado}
                </span>
                <span className="tabular-nums">{formatarDinheiro(e.totalCent)}</span>
              </li>
            ))}
          </ul>
        </SeccaoArea>
      ) : null}
    </>
  );
}
