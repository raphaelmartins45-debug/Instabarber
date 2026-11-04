"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";
import type { CoresCapa } from "@/lib/publico/cores-capa";

/**
 * As barras da página pública (E.6, D-200): a fina, no topo, nas cores do cabeçalho, quando ele
 * sai do ecrã (logótipo, nome, «Entrar» e «Marcar»); e a fixa no fundo, no telemóvel, com as três
 * ações, enquanto a página rola.
 */
export function Barras({
  lingua,
  nome,
  logo,
  cores,
  botao,
  marcar,
  whatsapp,
  telefone,
  entrar,
}: {
  lingua: Lingua;
  nome: string;
  logo: string | null;
  /** As cores do cabeçalho, para a barra do topo. */
  cores: CoresCapa;
  /** O botão no corpo claro, para a barra do fundo. */
  botao: { fundo: string; tinta: string };
  marcar: string | null;
  whatsapp: string | null;
  telefone: string | null;
  entrar: string;
}) {
  const t = textosPublicos(lingua);
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const capa = document.getElementById("capa");
    if (!capa) return;
    const obs = new IntersectionObserver(([e]) => setRolou(!e?.isIntersecting), { threshold: 0 });
    obs.observe(capa);
    return () => obs.disconnect();
  }, []);
  const classeBotao =
    "flex h-11 flex-1 items-center justify-center rounded-[var(--raio-botao)] px-3 text-sm font-bold";
  return (
    <>
      <div
        aria-hidden={!rolou}
        className={`fixed inset-x-0 top-0 z-30 transition-transform ${rolou ? "translate-y-0" : "-translate-y-full"}`}
        style={{ backgroundColor: cores.fundo, color: cores.tinta }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
            <img src={logo} alt="" className="h-8 w-auto object-contain" />
          ) : null}
          <span className="flex-1 truncate text-sm font-bold">{nome}</span>
          <Link
            href={entrar}
            className="flex h-10 items-center rounded-[var(--raio-botao)] border border-current/30 px-3 text-sm"
            tabIndex={rolou ? 0 : -1}
          >
            {t.capa.entrar}
          </Link>
          {marcar ? (
            <Link
              href={marcar}
              className="flex h-10 items-center rounded-[var(--raio-botao)] px-4 text-sm font-bold"
              style={{ backgroundColor: cores.destaque, color: cores.tintaDestaque }}
              tabIndex={rolou ? 0 : -1}
            >
              {t.capa.marcarCurto}
            </Link>
          ) : null}
        </div>
      </div>
      <nav
        aria-label={t.capa.marcar}
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-3 py-2 text-foreground md:hidden"
      >
        <div className="mx-auto flex max-w-5xl gap-2">
          {marcar ? (
            <Link
              href={marcar}
              className={classeBotao}
              style={{ backgroundColor: botao.fundo, color: botao.tinta }}
            >
              {t.capa.marcarCurto}
            </Link>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`${classeBotao} bg-[#1F9D55] text-white`}
            >
              {t.blocos.whatsapp}
            </a>
          ) : null}
          {telefone ? (
            <a href={`tel:${telefone}`} className={`${classeBotao} border`}>
              {t.blocos.telefone}
            </a>
          ) : null}
        </div>
      </nav>
    </>
  );
}
