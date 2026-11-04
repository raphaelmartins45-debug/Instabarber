"use client";

import { useEffect, useState } from "react";
import { vagasDoDia } from "@/app/(publico)/b/[slug]/marcar/acoes";
import { diaCurtoNaLingua, horaCurta, somarDias } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { VagaPublica } from "@/lib/repositorios/marcacao-publica";
import { cn } from "@/lib/utils";
import { EntrarFilaEspera } from "./entrar-fila-espera";

const DIAS_VISIVEIS = 21;

/** As vagas agrupadas por manhã (antes das 12:00), tarde (até às 18:00) e noite (D-205). */
function periodos(vagas: VagaPublica[]): ["manha" | "tarde" | "noite", VagaPublica[]][] {
  const de = (v: VagaPublica) => {
    const h = horaCurta(v.inicio);
    return h < "12:00" ? "manha" : h < "18:00" ? "tarde" : "noite";
  };
  return (["manha", "tarde", "noite"] as const)
    .map(
      (p) => [p, vagas.filter((v) => de(v) === p)] as ["manha" | "tarde" | "noite", VagaPublica[]],
    )
    .filter(([, l]) => l.length > 0);
}

/** Dia e hora (E.4, passo 3): só as vagas de vagas_livres(), com o preço riscado nas horas mortas. */
export function PassoHora({
  t,
  lingua,
  slug,
  servicoId,
  profissionalId,
  hoje,
  primeiroDia,
  janelaDias,
  diaInicial,
  filaEspera,
  aoEscolher,
}: {
  t: TextosPublicos;
  lingua: string;
  slug: string;
  servicoId: string;
  profissionalId: string | null;
  hoje: string;
  /** O primeiro dia com marcações possíveis: hoje, ou o próximo dia aberto (D-202). */
  primeiroDia: string;
  janelaDias: number;
  diaInicial?: string;
  /** Com a fila de espera ligada, um dia sem vagas oferece a fila (F.4.1). */
  filaEspera?: { cliente: { nome: string; telefone: string } | null };
  aoEscolher: (v: VagaPublica) => void;
}) {
  const dias = Array.from({ length: Math.min(DIAS_VISIVEIS, janelaDias + 1) }, (_, i) =>
    somarDias(primeiroDia, i),
  );
  const [dia, setDia] = useState(diaInicial ?? primeiroDia);
  const amanha = somarDias(hoje, 1);
  const [vagas, setVagas] = useState<VagaPublica[] | null>(null);
  useEffect(() => {
    let ativo = true;
    setVagas(null);
    void vagasDoDia(slug, servicoId, dia, profissionalId).then((v) => ativo && setVagas(v));
    return () => {
      ativo = false;
    };
  }, [slug, servicoId, dia, profissionalId]);
  return (
    <div className="grid gap-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist">
        {dias.map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={d === dia}
            onClick={() => setDia(d)}
            className={cn(
              "h-14 min-w-20 shrink-0 rounded-[var(--raio)] border px-2 text-sm capitalize transition-colors",
              d === dia
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:border-primary",
            )}
          >
            {d === hoje || d === amanha ? (
              <span className="grid leading-tight">
                <span className="font-bold normal-case">
                  {d === hoje ? t.marcacao.diaHoje : t.marcacao.diaAmanha}
                </span>
                <span className="text-xs opacity-75">{diaCurtoNaLingua(d, lingua)}</span>
              </span>
            ) : (
              diaCurtoNaLingua(d, lingua)
            )}
          </button>
        ))}
      </div>
      {vagas === null ? (
        <p className="text-sm text-muted-foreground">{t.marcacao.aCarregar}</p>
      ) : vagas.length === 0 ? (
        <>
          <p className="text-sm text-muted-foreground">{t.marcacao.semVagas}</p>
          {filaEspera ? (
            <EntrarFilaEspera
              key={dia}
              t={t}
              slug={slug}
              servicoId={servicoId}
              dia={dia}
              cliente={filaEspera.cliente}
            />
          ) : null}
        </>
      ) : (
        <div className="grid gap-4">
          {periodos(vagas).map(([periodo, lista]) => (
            <section key={periodo} className="grid gap-2" aria-label={t.marcacao[periodo]}>
              <h3 className="text-mini font-semibold tracking-wide text-muted-foreground uppercase">
                {t.marcacao[periodo]}
              </h3>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {lista.map((v) => (
                  <li key={`${v.inicio}-${v.profissionalId}`}>
                    <button
                      type="button"
                      onClick={() => aoEscolher(v)}
                      data-testid="vaga"
                      className="grid min-h-14 w-full place-items-center rounded-[var(--raio-botao)] border bg-card px-2 py-2 transition-colors hover:border-primary hover:bg-accent active:translate-y-px"
                    >
                      <span className="font-bold tabular-nums">{horaCurta(v.inicio)}</span>
                      {v.descontoPercent > 0 ? (
                        <span className="text-xs">
                          <s className="text-muted-foreground">
                            {formatarDinheiro(v.valorTabelaCent)}
                          </s>{" "}
                          {formatarDinheiro(v.valorCobradoCent)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {formatarDinheiro(v.valorCobradoCent)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
