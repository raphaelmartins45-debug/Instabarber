import Link from "next/link";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { ProfissionalPublico } from "@/lib/repositorios/barbearias-publicas";
import { AvatarBarbeiro } from "./avatar-barbeiro";
import { Bloco, CARTAO } from "./blocos";

const BOTAO =
  "inline-flex h-11 items-center justify-center rounded-[var(--raio-botao)] px-4 text-sm font-bold";

/**
 * A equipa (D-210): um cartão compacto por barbeiro, com a fotografia, o nome, as
 * especialidades, «Marcar» com ele e «Ver perfil» (a apresentação e os trabalhos).
 */
export function BlocoEquipa({
  t,
  equipa,
  base,
  marcar,
}: {
  t: TextosPublicos;
  equipa: ProfissionalPublico[];
  base: string;
  marcar: string | null;
}) {
  if (equipa.length === 0) return null;
  return (
    <Bloco id="equipa" titulo={t.blocos.barbeiros}>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {equipa.map((p) => (
          <li
            key={p.id}
            className={`${CARTAO} grid content-start gap-4 p-4`}
            data-testid="barbeiro"
          >
            <div className="flex items-center gap-3">
              <AvatarBarbeiro nome={p.nome} fotoUrl={p.fotoUrl} className="size-14 text-xl" />
              <div className="grid min-w-0">
                <span className="truncate text-lg font-bold" translate="no">
                  {p.nome}
                </span>
                {p.especialidades.length ? (
                  <span className="truncate text-sm text-muted-foreground">
                    {p.especialidades.join(" · ")}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {marcar ? (
                <Link
                  href={`${marcar}?profissional=${p.id}`}
                  className={`${BOTAO} bg-primary text-primary-foreground`}
                >
                  {t.capa.marcarCurto}
                </Link>
              ) : null}
              <Link
                href={`${base}/equipa/${p.id}`}
                className={`${BOTAO} border bg-card ${marcar ? "" : "col-span-2"}`}
              >
                {t.blocos.verPerfil}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Bloco>
  );
}
