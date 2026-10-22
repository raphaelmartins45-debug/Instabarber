import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { horaCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { MarcacaoDia } from "@/lib/repositorios/painel/agenda";
import { cn } from "@/lib/utils";
import { AcoesMarcacao } from "./acoes-marcacao";

const t = textos.agenda;

/** Uma marcação: hora, cliente, serviço, valor e estado; concluídas a verde (E.2). */
export function LinhaMarcacao({
  m,
  lembrete,
  mostrarProfissional = false,
  agora,
}: {
  m: MarcacaoDia;
  lembrete: string | null;
  mostrarProfissional?: boolean;
  agora: Date;
}) {
  const concluida = m.estado === "concluida";
  return (
    <li
      data-testid="marcacao"
      data-estado={m.estado}
      className={cn(
        "grid gap-2 rounded-lg border p-3",
        concluida ? "border-sucesso/40 bg-sucesso/5" : "bg-card",
        m.estado === "falta" && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-bold tabular-nums">
          {horaCurta(m.inicio)}–{horaCurta(m.fim)}
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {formatarDinheiro(m.valorCobradoCent)}
          {m.descontoPercent > 0 ? (
            <span className="ml-2 text-xs text-muted-foreground">
              {t.desconto(m.descontoPercent)}
            </span>
          ) : null}
        </span>
      </div>
      <div className="text-sm">
        <span className="font-semibold">{m.cliente ?? textos.comum.vazio}</span>
        <span className="text-muted-foreground"> · {m.servico}</span>
        {mostrarProfissional && m.profissional ? (
          <span className="text-muted-foreground"> · {m.profissional}</span>
        ) : null}
      </div>
      <span
        className={cn(
          "justify-self-start rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
          concluida ? "bg-sucesso/15 text-sucesso" : "bg-muted text-muted-foreground",
        )}
      >
        {t.estados[m.estado]}
      </span>
      {m.estado === "agendada" ? (
        <AcoesMarcacao
          id={m.id}
          lembrete={lembrete}
          lembreteAberto={!!m.lembreteAbertoEm}
          podeFaltar={new Date(m.inicio) <= agora}
        />
      ) : null}
    </li>
  );
}
