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
 * Ação destrutiva (suspender, cancelar, apagar…): nunca fica a um toque, pede confirmação
 * explícita (I.3.1). O gatilho é o botão que se passa como filho.
 */
export function ConfirmarAcao({
  titulo,
  descricao,
  confirmar,
  aoConfirmar,
  children,
}: {
  titulo: string;
  descricao: string;
  confirmar: string;
  aoConfirmar: () => void;
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
            className="bg-destructive hover:bg-destructive/90"
            onClick={aoConfirmar}
          >
            {confirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
