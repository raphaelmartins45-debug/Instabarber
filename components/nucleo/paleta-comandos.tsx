"use client";

import { CalendarPlus, Search, UserSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";
import { IconeMenu } from "./icone-menu";

const t = textos.paineis.comandos;

type Opcao = { id: string; rotulo: string; href: string; icone: ReactNode; grupo: string };

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Lista da paleta: os ecrãs ativos e as ações que esses ecrãs permitem. */
function montarOpcoes(itens: ItemMontado[], busca: string): Opcao[] {
  const ativos = itens.filter((i) => i.estado === "ativo");
  const q = normalizar(busca.trim());
  const ecras: Opcao[] = ativos.map((i) => ({
    id: i.id,
    rotulo: i.rotulo,
    href: i.href,
    icone: <IconeMenu id={i.id} className="size-4" />,
    grupo: t.ecras,
  }));
  const acoes: Opcao[] = [];
  if (ativos.some((i) => i.href === "/app/agenda"))
    acoes.push({
      id: "nova-marcacao",
      rotulo: t.novaMarcacao,
      href: "/app/agenda/marcar",
      icone: <CalendarPlus aria-hidden className="size-4" />,
      grupo: t.acoes,
    });
  const filtradas = [...ecras, ...acoes].filter((o) => !q || normalizar(o.rotulo).includes(q));
  if (q && ativos.some((i) => i.href === "/app/clientes"))
    filtradas.push({
      id: "procurar-cliente",
      rotulo: t.procurarCliente(busca.trim()),
      href: `/app/clientes?q=${encodeURIComponent(busca.trim())}`,
      icone: <UserSearch aria-hidden className="size-4" />,
      grupo: t.acoes,
    });
  return filtradas;
}

/** Botão «Procurar» do cabeçalho e a paleta Ctrl/Cmd K: ir a um ecrã ou fazer uma ação. */
export function PaletaComandos({ itens }: { itens: ItemMontado[] }) {
  const [aberta, setAberta] = useState(false);
  const [busca, setBusca] = useState("");
  const [indice, setIndice] = useState(0);
  const campo = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const opcoes = useMemo(() => montarOpcoes(itens, busca), [itens, busca]);

  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberta((a) => !a);
      }
    };
    document.addEventListener("keydown", atalho);
    return () => document.removeEventListener("keydown", atalho);
  }, []);

  useEffect(() => {
    if (aberta) {
      setBusca("");
      setIndice(0);
      campo.current?.focus();
    }
  }, [aberta]);

  const ir = (o: Opcao | undefined) => {
    if (!o) return;
    setAberta(false);
    router.push(o.href);
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndice((i) => Math.min(i + 1, opcoes.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      ir(opcoes[indice]);
    } else if (e.key === "Escape") {
      setAberta(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        aria-label={t.abrir}
        className="flex h-10 items-center gap-2 rounded-lg border border-border bg-foreground/[.03] px-3 text-sm text-muted-foreground transition-colors duration-200 ease-sistema hover:text-foreground"
      >
        <Search aria-hidden className="size-4" />
        <span className="hidden lg:inline">{t.abrir}</span>
        <kbd className="hidden rounded border border-border px-1.5 text-[11px] text-terciario lg:inline">
          {t.atalho}
        </kbd>
      </button>
      {aberta ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setAberta(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.titulo}
            data-testid="paleta-comandos"
            className="flutuante animate-entrada w-full max-w-lg overflow-hidden rounded-2xl shadow-flutuante"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search aria-hidden className="size-4 text-terciario" />
              <input
                ref={campo}
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setIndice(0);
                }}
                onKeyDown={teclas}
                placeholder={t.placeholder}
                aria-label={t.titulo}
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-terciario"
              />
            </div>
            <ul role="listbox" aria-label={t.titulo} className="max-h-80 overflow-y-auto p-2">
              {opcoes.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">{t.vazio}</li>
              ) : (
                opcoes.map((o, i) => (
                  <li key={o.id} role="option" aria-selected={i === indice}>
                    {i === 0 || opcoes[i - 1]!.grupo !== o.grupo ? (
                      <p className="rotulo px-3 pt-2 pb-1">{o.grupo}</p>
                    ) : null}
                    <button
                      type="button"
                      onMouseEnter={() => setIndice(i)}
                      onClick={() => ir(o)}
                      className={cn(
                        "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm",
                        i === indice ? "bg-accent text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {o.icone}
                      {o.rotulo}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <p className="border-t border-border px-4 py-2 text-xs text-terciario">{t.ajuda}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
