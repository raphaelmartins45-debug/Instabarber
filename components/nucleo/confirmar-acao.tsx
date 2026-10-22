"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { textos } from "@/lib/i18n/pt-PT";

/**
 * Ação que pede confirmação explícita (I.3.1): as destrutivas (suspender, cancelar, apagar…)
 * nunca ficam a um toque. O gatilho é o botão que se passa como filho.
 */
export function ConfirmarAcao({
  titulo,
  descricao,
  confirmar,
  aoConfirmar,
  destrutiva = true,
  children,
}: {
  titulo: string;
  descricao: string;
  confirmar: string;
  aoConfirmar: () => void;
  /** Falso para confirmações que não apagam nem retiram nada (ex.: aprovar). */
  destrutiva?: boolean;
  children: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{titulo}</AlertDialogTitle>
        <AlertDialogDescription>{descricao}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>{textos.comum.cancelar}</AlertDialogCancel>
          <AlertDialogAction
            className={destrutiva ? "bg-destructive hover:bg-destructive/90" : undefined}
            onClick={aoConfirmar}
          >
            {confirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
