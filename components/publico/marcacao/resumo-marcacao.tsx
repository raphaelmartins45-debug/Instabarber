import { dataLongaNaLingua, horaCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { ResumoMovel } from "./progresso-marcacao";

/**
 * O resumo ao lado dos passos, só no computador (D-129): a barbearia e o que já foi escolhido.
 * No telemóvel, cada passo ocupa o ecrã (I.3, camada 4).
 */
export function ResumoMarcacao({
  t,
  lingua,
  barbearia,
  morada,
  servico,
  barbeiro,
  inicio,
  valorCent,
}: {
  t: TextosPublicos;
  lingua: string;
  barbearia: string;
  morada: string;
  servico?: { nome: string; duracao: number; precoCent: number };
  barbeiro?: string;
  inicio?: string;
  valorCent?: number;
}) {
  const m = t.marcacao;
  const linha = (rotulo: string, valor: string | undefined) => (
    <div className="grid gap-0.5">
      <dt className="text-mini font-semibold tracking-wide text-muted-foreground uppercase">
        {rotulo}
      </dt>
      <dd className={valor ? "font-semibold" : "text-muted-foreground"}>
        {valor ?? m.porEscolher}
      </dd>
    </div>
  );
  return (
    <aside
      className="cartao-modelo hidden rounded-[var(--raio)] border bg-card p-5 text-card-foreground md:sticky md:top-6 md:grid md:gap-4"
      data-testid="resumo-marcacao"
    >
      <div>
        <p className="text-lg font-extrabold">{m.suaMarcacao}</p>
        <p className="text-sm text-muted-foreground">
          {barbearia}
          {morada ? ` · ${morada}` : ""}
        </p>
      </div>
      <dl className="grid gap-3">
        {linha(
          t.email.servico,
          servico ? `${servico.nome} · ${t.blocos.minutos(servico.duracao)}` : undefined,
        )}
        {linha(t.email.barbeiro, barbeiro)}
        {linha(
          t.email.quando,
          inicio ? `${dataLongaNaLingua(inicio, lingua)}, ${horaCurta(inicio)}` : undefined,
        )}
      </dl>
      {servico ? (
        <p className="border-t pt-3 text-right text-xl font-extrabold tabular-nums">
          {formatarDinheiro(valorCent ?? servico.precoCent)}
        </p>
      ) : null}
    </aside>
  );
}

/** Os resumos da marcação (D-205): o painel ao lado no computador e a barra no telemóvel. */
export function Resumos({
  t,
  lingua,
  barbearia,
  servico,
  barbeiro,
  reserva,
  movel,
}: {
  t: TextosPublicos;
  lingua: string;
  barbearia: { nome: string; morada: string };
  servico?: { nome: string; duracao: number; precoCent: number };
  barbeiro?: string;
  reserva: { inicio: string; valorCobradoCent: number } | null;
  /** Mostrar a barra do telemóvel (nos passos do barbeiro e da hora). */
  movel: boolean;
}) {
  return (
    <>
      {movel && servico ? (
        <>
          {/* Espaço para a barra fixa não tapar as últimas horas. */}
          <div aria-hidden className="h-20 md:hidden" />
          <ResumoMovel servico={servico.nome} barbeiro={barbeiro} />
        </>
      ) : null}
      <ResumoMarcacao
        t={t}
        lingua={lingua}
        barbearia={barbearia.nome}
        morada={barbearia.morada}
        servico={servico}
        barbeiro={barbeiro}
        inicio={reserva?.inicio}
        valorCent={reserva?.valorCobradoCent}
      />
    </>
  );
}
