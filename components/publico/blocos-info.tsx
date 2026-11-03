import { AtSign, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { Bloco, CARTAO } from "./blocos";

// Blocos de informação (E.6, D-200): história, onde estamos, horário e contactos, em cartões.

export function BlocoHistoria({ t, historia }: { t: TextosPublicos; historia: string | null }) {
  if (!historia) return null;
  return (
    <Bloco id="historia" titulo={t.blocos.historia}>
      <div className={`${CARTAO} p-5 md:p-8`}>
        <p className="max-w-prose text-base leading-relaxed whitespace-pre-line text-pretty md:text-lg">
          {historia}
        </p>
      </div>
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
      <div className={`${CARTAO} grid gap-4 p-5`}>
        {morada ? (
          <p className="flex gap-3 leading-snug">
            <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            {morada}
          </p>
        ) : null}
        {mapa ? (
          <a
            href={mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-[var(--raio)] border border-borda-forte px-4 text-sm font-semibold transition-colors hover:bg-campo sm:justify-self-start"
          >
            {t.blocos.abrirMapa}
          </a>
        ) : null}
      </div>
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
      <div className={`${CARTAO} overflow-hidden`}>
        <p className="flex items-center gap-2 border-b px-5 py-3.5 text-sm font-semibold">
          <span aria-hidden className="size-2 rounded-full bg-current" />
          {estado}
        </p>
        <dl className="divide-y text-sm">
          {ordem.map((d) => (
            <div key={d} className="flex justify-between gap-4 px-5 py-2.5">
              <dt>{t.dias[d]}</dt>
              <dd
                className={
                  descanso.includes(d) ? "text-muted-foreground" : "font-medium tabular-nums"
                }
              >
                {descanso.includes(d) ? t.blocos.descanso : `${abertura}–${fecho}`}
              </dd>
            </div>
          ))}
        </dl>
        {almoco ? (
          <p className="border-t px-5 py-3 text-sm text-muted-foreground">
            {t.blocos.almoco(almoco[0], almoco[1])}
          </p>
        ) : null}
      </div>
    </Bloco>
  );
}

function Linha({
  href,
  icone,
  rotulo,
  valor,
  fora,
}: {
  href: string;
  icone: ReactNode;
  rotulo: string;
  valor: string;
  fora?: boolean;
}) {
  const classe = "flex min-h-14 items-center gap-3 px-5 py-3 transition-colors hover:bg-campo";
  const conteudo = (
    <>
      <span aria-hidden className="text-muted-foreground">
        {icone}
      </span>
      <span className="grid flex-1">
        <span className="text-xs text-muted-foreground">{rotulo}</span>
        <span className="font-semibold">{valor}</span>
      </span>
    </>
  );
  return (
    <li>
      {fora ? (
        <Link href={href} target="_blank" rel="noopener noreferrer" className={classe}>
          {conteudo}
        </Link>
      ) : (
        <a href={href} className={classe}>
          {conteudo}
        </a>
      )}
    </li>
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
  const icone = "size-5";
  return (
    <Bloco id="contactos" titulo={t.blocos.contactos}>
      <ul className={`${CARTAO} divide-y overflow-hidden`}>
        {whatsapp ? (
          <Linha
            href={whatsapp}
            fora
            icone={<MessageCircle className={icone} />}
            rotulo={t.blocos.whatsapp}
            valor={t.capa.falar}
          />
        ) : null}
        {telefone ? (
          <Linha
            href={`tel:${telefone}`}
            icone={<Phone className={icone} />}
            rotulo={t.blocos.telefone}
            valor={formatarTelefone(telefone)}
          />
        ) : null}
        {redes.map((r) => (
          <Linha
            key={r.url}
            href={r.url}
            fora
            icone={<AtSign className={icone} />}
            rotulo={r.rotulo}
            valor={r.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          />
        ))}
      </ul>
    </Bloco>
  );
}
