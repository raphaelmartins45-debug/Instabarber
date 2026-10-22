import Link from "next/link";
import { textos } from "@/lib/i18n/pt-PT";
import type { EstadoConvite } from "@/lib/regras/convite";
import { BotaoReenviar } from "./botao-reenviar";

const t = textos.paineis.equipa;

export type LinhaEquipa = {
  id: string;
  nome: string;
  email: string | null;
  estado: EstadoConvite;
  ativo: boolean;
};

/** A equipa com o estado de cada convite. No telemóvel, cada linha é um cartão. */
export function ListaEquipa({ linhas }: { linhas: LinhaEquipa[] }) {
  return (
    <ul className="grid gap-2">
      {linhas.map((l) => (
        <li
          key={l.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3"
          data-testid="membro-equipa"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/app/sistema/equipa?p=${l.id}`}
              className="block truncate font-semibold text-ligacao underline-offset-4 hover:underline"
            >
              {l.nome}
            </Link>
            <p className="truncate text-sm text-muted-foreground">{l.email}</p>
          </div>
          {!l.ativo ? (
            <span className="text-sm text-muted-foreground">{textos.sistema.equipa.inativo}</span>
          ) : l.estado === "ativo" ? (
            <span className="text-sm text-sucesso">{t.ativo}</span>
          ) : (
            <span className="text-sm text-muted-foreground">{t.aguarda}</span>
          )}
          {l.estado === "reenviar" ? <BotaoReenviar profissionalId={l.id} /> : null}
        </li>
      ))}
    </ul>
  );
}
