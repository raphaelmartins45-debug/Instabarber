"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";

/**
 * As barras da página pública (E.6): a fina, no topo, quando a capa sai do ecrã (logótipo, nome,
 * «Entrar» e «Marcar»); e a fixa no fundo, com as três ações, enquanto a página rola.
 */
export function Barras({
  lingua,
  nome,
  logo,
  cor,
  corTexto,
  marcar,
  whatsapp,
  telefone,
  entrar,
}: {
  lingua: Lingua;
  nome: string;
  logo: string | null;
  cor: string;
  corTexto: string;
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
  const botao = "flex h-11 flex-1 items-center justify-center rounded-lg px-3 text-sm font-bold";
  return (
    <>
      <div
        aria-hidden={!rolou}
        className={`fixed inset-x-0 top-0 z-30 border-b bg-white/95 backdrop-blur transition-transform ${rolou ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
            <img src={logo} alt="" className="size-8 rounded-full border object-contain" />
          ) : null}
          <span className="flex-1 truncate text-sm font-bold">{nome}</span>
          <Link
            href={entrar}
            className="flex h-10 items-center rounded-full border px-3 text-sm"
            tabIndex={rolou ? 0 : -1}
          >
            {t.capa.entrar}
          </Link>
          {marcar ? (
            <Link
              href={marcar}
              className="flex h-10 items-center rounded-full px-4 text-sm font-bold"
              style={{ backgroundColor: cor, color: corTexto }}
              tabIndex={rolou ? 0 : -1}
            >
              {t.capa.marcarCurto}
            </Link>
          ) : null}
        </div>
      </div>
      <nav
        aria-label={t.capa.marcar}
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-3 py-2 backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-5xl gap-2">
          {marcar ? (
            <Link href={marcar} className={botao} style={{ backgroundColor: cor, color: corTexto }}>
              {t.capa.marcarCurto}
            </Link>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`${botao} bg-[#1F9D55] text-white`}
            >
              {t.blocos.whatsapp}
            </a>
          ) : null}
          {telefone ? (
            <a href={`tel:${telefone}`} className={`${botao} border`}>
              {t.blocos.telefone}
            </a>
          ) : null}
        </div>
      </nav>
    </>
  );
}
