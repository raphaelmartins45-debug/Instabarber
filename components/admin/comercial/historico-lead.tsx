import { dataHora } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { EventoLead } from "@/lib/repositorios/comercial/leads";

const t = textos.comercial;

type Detalhes = {
  de?: string;
  para?: string;
  motivo?: string;
  passo?: number;
  dificuldade?: string;
  distrito?: string;
};

/** Texto de um evento: o que foi escrito, ou o que a base de dados registou sozinha. */
function descrever(e: EventoLead): string | null {
  const d = (e.detalhes ?? {}) as Detalhes;
  if (e.tipo === "estado" && d.de && d.para) {
    const base = t.ficha.mudouEstado(t.estados[d.de] ?? d.de, t.estados[d.para] ?? d.para);
    return d.motivo ? `${base} ${d.motivo}` : base;
  }
  const extra = d.passo === 2 ? t.ficha.passo2(d.dificuldade, d.distrito) : "";
  return [e.texto, extra].filter(Boolean).join(" ") || null;
}

/** Linha do tempo do lead (N.3), do mais recente para o mais antigo. */
export function HistoricoLead({ eventos }: { eventos: EventoLead[] }) {
  if (eventos.length === 0)
    return <p className="text-sm text-muted-foreground">{t.ficha.semHistorico}</p>;
  return (
    <ol className="grid gap-3 border-l border-border pl-4" data-testid="historico-lead">
      {eventos.map((e) => (
        <li key={e.id} className="relative grid gap-0.5">
          <span
            aria-hidden
            className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border border-border bg-elevado"
          />
          <span className="text-xs text-terciario">
            {t.ficha.eventos[e.tipo] ?? e.tipo} · {dataHora(e.criado_em)}
          </span>
          {descrever(e) ? <span className="text-sm">{descrever(e)}</span> : null}
        </li>
      ))}
    </ol>
  );
}
