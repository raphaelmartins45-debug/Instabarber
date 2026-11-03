import Link from "next/link";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { Bloco } from "./blocos";

// Blocos de informação (E.6): história, onde estamos, horário e contactos.

export function BlocoHistoria({ t, historia }: { t: TextosPublicos; historia: string | null }) {
  if (!historia) return null;
  return (
    <Bloco id="historia" titulo={t.blocos.historia}>
      <p className="max-w-4xl text-2xl leading-snug whitespace-pre-line text-pretty md:text-4xl md:leading-tight">
        {historia}
      </p>
    </Bloco>
  );
}

export function BlocoMapa({
  t,
  morada,
  mapa,
}: {
  t: TextosPublicos;
  morada: string | null;
  mapa: string | null;
}) {
  if (!morada && !mapa) return null;
  return (
    <Bloco id="onde" titulo={t.blocos.ondeEstamos}>
      {morada ? <p className="max-w-3xl text-3xl leading-tight md:text-5xl">{morada}</p> : null}
      {mapa ? (
        <a
          href={mapa}
          target="_blank"
          rel="noopener noreferrer"
          className="justify-self-start bg-foreground px-6 py-4 font-semibold text-background transition-opacity hover:opacity-85"
        >
          {t.blocos.abrirMapa}
        </a>
      ) : null}
    </Bloco>
  );
}

export function BlocoHorario({
  t,
  abertura,
  fecho,
  descanso,
  almoco,
  estado,
}: {
  t: TextosPublicos;
  abertura: string;
  fecho: string;
  descanso: number[];
  almoco: [string, string] | null;
  estado: string;
}) {
  // A semana começa à segunda-feira.
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  return (
    <Bloco id="horario" titulo={t.blocos.horario}>
      <p className="text-xl font-semibold">{estado}</p>
      <dl className="grid max-w-xl gap-1.5">
        {ordem.map((d) => (
          <div key={d} className="flex justify-between gap-4 bg-muted px-5 py-3">
            <dt>{t.dias[d]}</dt>
            <dd className="tabular-nums">
              {descanso.includes(d) ? t.blocos.descanso : `${abertura}–${fecho}`}
            </dd>
          </div>
        ))}
      </dl>
      {almoco ? (
        <p className="text-sm text-muted-foreground">{t.blocos.almoco(almoco[0], almoco[1])}</p>
      ) : null}
    </Bloco>
  );
}

export function BlocoContactos({
  t,
  whatsapp,
  telefone,
  redes,
}: {
  t: TextosPublicos;
  whatsapp: string | null;
  telefone: string | null;
  redes: { rotulo: string; url: string }[];
}) {
  if (!whatsapp && !telefone && redes.length === 0) return null;
  const ligacao = "text-2xl font-semibold underline-offset-4 hover:underline md:text-3xl";
  return (
    <Bloco id="contactos" titulo={t.blocos.contactos}>
      <ul className="grid gap-2">
        {whatsapp ? (
          <li>
            {t.blocos.whatsapp}:{" "}
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={ligacao}>
              {t.capa.falar}
            </a>
          </li>
        ) : null}
        {telefone ? (
          <li>
            {t.blocos.telefone}:{" "}
            <a href={`tel:${telefone}`} className={ligacao}>
              {formatarTelefone(telefone)}
            </a>
          </li>
        ) : null}
        {redes.map((r) => (
          <li key={r.url}>
            <Link href={r.url} target="_blank" rel="noopener noreferrer" className={ligacao}>
              {r.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </Bloco>
  );
}
