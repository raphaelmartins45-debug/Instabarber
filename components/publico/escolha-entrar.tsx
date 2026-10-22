"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";

/** «Entrar»: a escolha das três pessoas (E.6) — cliente, gestor e barbeiro. */
export function EscolhaEntrar({
  lingua,
  entradas,
  cor,
}: {
  lingua: Lingua;
  entradas: { cliente: string; equipa: string };
  cor: string;
}) {
  const t = textosPublicos(lingua);
  const [aberto, setAberto] = useState(false);
  const opcao = "grid min-h-14 content-center rounded-xl border bg-card px-4 py-3 text-left";
  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="h-11 shrink-0 rounded-full border px-4 text-sm font-semibold"
        style={{ borderColor: cor, color: cor }}
      >
        {t.capa.entrar}
      </button>
      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogTitle>{t.entrar.titulo}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">{t.entrar.titulo}</AlertDialogDescription>
          <div className="grid gap-2">
            <Link href={entradas.cliente} className={opcao}>
              <span className="font-bold">{t.entrar.cliente}</span>
              <span className="text-xs text-muted-foreground">{t.entrar.clienteAjuda}</span>
            </Link>
            <Link href={entradas.equipa} className={opcao}>
              <span className="font-bold">{t.entrar.gestor}</span>
            </Link>
            <Link href={entradas.equipa} className={opcao}>
              <span className="font-bold">{t.entrar.barbeiro}</span>
            </Link>
          </div>
          <AlertDialogCancel className="h-11">{t.entrar.fechar}</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
