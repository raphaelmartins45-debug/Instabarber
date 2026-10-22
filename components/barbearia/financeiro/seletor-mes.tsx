import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mesAnterior, mesPorExtenso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.financeiro.acertos;

/** Mês anterior e seguinte (?mes=AAAA-MM). */
export function SeletorMes({ mes, base }: { mes: string; base: string }) {
  const botao = "flex size-11 items-center justify-center rounded-md border bg-card";
  return (
    <div className="flex items-center gap-2">
      <Link href={`${base}?mes=${mesAnterior(mes)}`} className={botao} aria-label={t.mesAnterior}>
        <ChevronLeft className="size-4" aria-hidden />
      </Link>
      <span className="min-w-40 text-center text-[15px] font-bold first-letter:uppercase">
        {mesPorExtenso(mes)}
      </span>
      <Link
        href={`${base}?mes=${mesAnterior(mes, -1)}`}
        className={botao}
        aria-label={t.mesSeguinte}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
