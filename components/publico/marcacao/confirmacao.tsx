"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { dataLongaNaLingua, horaCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { ficheiroCalendario } from "@/lib/regras/calendario";

/** Confirmação (E.4, passo 6): resumo, regra de cancelamento (H.2) e «Adicionar ao calendário». */
export function Confirmacao({
  t,
  lingua,
  id,
  servico,
  barbeiro,
  inicio,
  fim,
  valorCent,
  barbearia,
  morada,
  cancelamentoMin,
  acesso,
  area,
  nova,
}: {
  t: TextosPublicos;
  lingua: string;
  id: string;
  servico: string;
  barbeiro: string;
  inicio: string;
  fim: string;
  valorCent: number;
  barbearia: string;
  morada: string;
  cancelamentoMin: number;
  acesso: "criado" | "codigo" | null;
  area: string;
  nova: () => void;
}) {
  const m = t.marcacao;
  const calendario = () => {
    const ics = ficheiroCalendario({
      id,
      titulo: `${servico} · ${barbearia}`,
      inicio,
      fim,
      local: morada,
      descricao: `${servico} · ${barbeiro}`,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "marcacao.ics" });
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="grid gap-4" data-testid="marcacao-confirmada">
      <h2 className="text-xl font-extrabold">{m.feita}</h2>
      <p className="text-[15px] font-semibold first-letter:uppercase">
        {m.resumo(servico, barbeiro, dataLongaNaLingua(inicio, lingua), horaCurta(inicio))}
      </p>
      <p>
        {m.valor}: <strong>{formatarDinheiro(valorCent)}</strong>
      </p>
      <p className="text-sm text-muted-foreground">{m.cancelamento(t.duracao(cancelamentoMin))}</p>
      {acesso === "criado" ? <p className="text-sm font-semibold">{m.acessoCriado}</p> : null}
      {acesso === "codigo" ? <p className="text-sm">{m.acessoComCodigo}</p> : null}
      <Button variant="outline" className="h-12" onClick={calendario}>
        {m.calendario}
      </Button>
      {acesso === "criado" ? (
        <Button asChild className="h-12">
          <Link href={area}>{m.irArea}</Link>
        </Button>
      ) : null}
      <Button variant="ghost" className="h-12" onClick={nova}>
        {m.nova}
      </Button>
    </div>
  );
}
