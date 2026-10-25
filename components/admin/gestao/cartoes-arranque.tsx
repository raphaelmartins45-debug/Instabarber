import Link from "next/link";
import { BarraProgresso } from "@/components/nucleo/barra-progresso";
import { PASSOS_ARRANQUE, type PassoArranque } from "@/lib/admin/saude";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.gestao.arranque;

export type CartaoArranque = {
  id: string;
  nome: string;
  percentagem: number;
  feito: Record<PassoArranque, boolean>;
};

/** Arranque das barbearias novas (sugestão B): a percentagem e o que ainda falta. */
export function CartoesArranque({ cartoes }: { cartoes: CartaoArranque[] }) {
  if (!cartoes.length) return <p className="text-sm text-muted-foreground">{t.vazio}</p>;
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {cartoes.map((c) => {
        const falta = PASSOS_ARRANQUE.filter((p) => !c.feito[p]);
        return (
          <li key={c.id} className="cartao grid gap-2 rounded-2xl p-4" data-testid="arranque">
            <Link
              href={`/admin/barbearias/${c.id}`}
              className="font-semibold text-ligacao underline"
            >
              {c.nome}
            </Link>
            <BarraProgresso percentagem={c.percentagem} rotulo={t.percentagem(c.percentagem)} />
            <p className="text-sm">{t.percentagem(c.percentagem)}</p>
            <p className="text-sm text-muted-foreground">
              {falta.length
                ? `${t.falta} ${falta.map((p) => t.passos[p]).join(" · ")}`
                : t.completo}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
