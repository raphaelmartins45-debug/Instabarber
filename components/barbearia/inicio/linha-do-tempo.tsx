import Link from "next/link";
import { horaCurta, instanteLocal } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { posicaoNoDia } from "@/lib/regras/painel-inicio";
import type { MarcacaoDia } from "@/lib/repositorios/painel/agenda";
import { cn } from "@/lib/utils";

const t = textos.inicio.linha;

type Periodo = { profissionalId: string | null; inicio: string; fim: string; tipo: string };

/**
 * O dia na cadeira (D-203): uma pista por barbeiro, das horas de abertura às de fecho, com as
 * marcações (concluídas a verde, por fazer a dourado), as ausências tracejadas e a hora de agora.
 * No telemóvel, a lista de marcações faz este papel.
 */
export function LinhaDoTempo({
  dia,
  abertura,
  fecho,
  equipa,
  marcacoes,
  ausencias,
  agora,
}: {
  dia: string;
  abertura: string;
  fecho: string;
  equipa: { id: string; nome: string }[];
  marcacoes: MarcacaoDia[];
  ausencias: Periodo[];
  agora: Date;
}) {
  const pos = (p: { inicio: string | Date; fim: string | Date }) =>
    posicaoNoDia(p, dia, abertura, fecho);
  const primeira = Number(abertura.slice(0, 2));
  const horas = Array.from(
    { length: Number(fecho.slice(0, 2)) - primeira + 1 },
    (_, i) => primeira + i,
  );
  const marcaAgora = pos({ inicio: agora, fim: new Date(agora.getTime() + 60_000) });
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-[6rem_1fr] text-mini text-muted-foreground">
        <span />
        <div className="relative h-4">
          {horas.map((h) => {
            const x = pos({
              inicio: instanteLocal(dia, `${String(h).padStart(2, "0")}:00`),
              fim: instanteLocal(dia, `${String(h).padStart(2, "0")}:01`),
            });
            return x ? (
              <span
                key={h}
                className="numero absolute -translate-x-1/2"
                style={{ left: `${x.esquerda}%` }}
              >
                {String(h).padStart(2, "0")}
              </span>
            ) : null;
          })}
        </div>
      </div>
      {equipa.map((p) => (
        <div key={p.id} className="grid grid-cols-[6rem_1fr] items-center">
          <span className="truncate pr-2 text-sm font-semibold">{p.nome}</span>
          <div className="relative h-12 rounded-lg bg-campo">
            {ausencias
              .filter((a) => a.profissionalId === null || a.profissionalId === p.id)
              .map((a) => {
                const x = pos(a);
                return x ? (
                  <span
                    key={`${a.inicio}-${a.profissionalId}`}
                    className="absolute inset-y-1 rounded-md border border-dashed border-borda-forte bg-[repeating-linear-gradient(135deg,var(--campo)_0_6px,transparent_6px_12px)] px-2 py-1 text-mini text-muted-foreground"
                    style={{ left: `${x.esquerda}%`, width: `${x.largura}%` }}
                  >
                    {x.largura >= 7 ? (
                      <span className="block truncate">{textos.agenda.tiposAusencia[a.tipo]}</span>
                    ) : null}
                  </span>
                ) : null;
              })}
            {marcacoes
              .filter((m) => m.profissionalId === p.id && m.estado !== "cancelada")
              .map((m) => {
                const x = pos(m);
                if (!x) return null;
                const feita = m.estado === "concluida";
                return (
                  <Link
                    key={m.id}
                    href={`/app/agenda?dia=${dia}`}
                    title={`${horaCurta(m.inicio)} · ${m.cliente ?? ""} · ${m.servico}`}
                    className={cn(
                      "absolute inset-y-1 overflow-hidden rounded-md border px-2 py-1 text-mini leading-tight",
                      feita
                        ? "border-sucesso/40 bg-sucesso/10"
                        : m.estado === "falta"
                          ? "border-destructive/40 bg-destructive/10 line-through"
                          : "border-destaque/50 bg-destaque/15",
                    )}
                    style={{ left: `${x.esquerda}%`, width: `${x.largura}%` }}
                  >
                    {x.largura >= 7 ? (
                      <>
                        <span className="block truncate font-semibold">
                          {(m.cliente ?? m.servico).split(" ")[0]}
                        </span>
                        <span className="block truncate text-muted-foreground">
                          {horaCurta(m.inicio)}
                        </span>
                      </>
                    ) : (
                      <span className="block truncate text-center font-semibold">
                        <span aria-hidden>{(m.cliente ?? m.servico).charAt(0)}</span>
                        <span className="sr-only">{`${horaCurta(m.inicio)} ${m.cliente ?? ""}`}</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            {marcaAgora ? (
              <span
                aria-hidden
                className="absolute -inset-y-1 w-0.5 bg-destructive"
                style={{ left: `${marcaAgora.esquerda}%` }}
              />
            ) : null}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">{t.legenda}</p>
    </div>
  );
}
