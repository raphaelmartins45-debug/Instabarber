import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { diaPorExtenso, somarDias } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.agenda;

/** Navegação entre dias: anterior, hoje, seguinte e escolha da data (formulário GET). */
export function SeletorDia({ dia, hoje, base }: { dia: string; hoje: string; base: string }) {
  const ir = (d: string) => `${base}?dia=${d}`;
  const botao =
    "flex h-11 min-w-11 items-center justify-center rounded-md border bg-card px-3 text-sm";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={ir(somarDias(dia, -1))} className={botao} aria-label={t.anterior}>
        <ChevronLeft className="size-4" aria-hidden />
      </Link>
      <Link href={ir(hoje)} className={botao} aria-current={dia === hoje ? "date" : undefined}>
        {t.hoje}
      </Link>
      <Link href={ir(somarDias(dia, 1))} className={botao} aria-label={t.seguinte}>
        <ChevronRight className="size-4" aria-hidden />
      </Link>
      <form action={base} className="flex items-center gap-2">
        <label className="sr-only" htmlFor="dia">
          {t.escolherDia}
        </label>
        <input
          id="dia"
          name="dia"
          type="date"
          defaultValue={dia}
          className="h-11 rounded-md border bg-card px-3 text-sm"
        />
        <button type="submit" className={botao}>
          {t.escolherDia}
        </button>
      </form>
      <h2 className="w-full text-[15px] font-bold first-letter:uppercase sm:w-auto sm:pl-2">
        {diaPorExtenso(dia)}
      </h2>
    </div>
  );
}
