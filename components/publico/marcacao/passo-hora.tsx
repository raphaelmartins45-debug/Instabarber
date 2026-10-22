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

/** Dia e hora (E.4, passo 3): só as vagas de vagas_livres(), com o preço riscado nas horas mortas. */
export function PassoHora({
  t,
  lingua,
  slug,
  servicoId,
  profissionalId,
  hoje,
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
  janelaDias: number;
  diaInicial?: string;
  /** Com a fila de espera ligada, um dia sem vagas oferece a fila (F.4.1). */
  filaEspera?: { cliente: { nome: string; telefone: string } | null };
  aoEscolher: (v: VagaPublica) => void;
}) {
  const dias = Array.from({ length: Math.min(DIAS_VISIVEIS, janelaDias + 1) }, (_, i) =>
    somarDias(hoje, i),
  );
  const [dia, setDia] = useState(diaInicial ?? hoje);
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
              "h-14 min-w-20 shrink-0 rounded-xl border px-2 text-sm capitalize",
              d === dia ? "bg-foreground text-background" : "bg-card",
            )}
          >
            {diaCurtoNaLingua(d, lingua)}
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
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {vagas.map((v) => (
            <li key={`${v.inicio}-${v.profissionalId}`}>
              <button
                type="button"
                onClick={() => aoEscolher(v)}
                data-testid="vaga"
                className="grid min-h-14 w-full place-items-center rounded-xl border bg-card px-2 py-2 hover:bg-muted"
              >
                <span className="font-bold tabular-nums">{horaCurta(v.inicio)}</span>
                {v.descontoPercent > 0 ? (
                  <span className="text-xs">
                    <s className="text-muted-foreground">{formatarDinheiro(v.valorTabelaCent)}</s>{" "}
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
      )}
    </div>
  );
}
