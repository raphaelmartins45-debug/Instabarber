"use client";

import { useState, type ReactNode } from "react";
import { Campo } from "@/components/nucleo/campo";
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

/** Confirmação que pede um texto (o slug para eliminar, a justificação da vista de apoio). */
export function DialogoTexto({
  titulo,
  descricao,
  rotulo,
  confirmar,
  minimo,
  destrutiva,
  aoConfirmar,
  children,
}: {
  titulo: string;
  descricao: string;
  rotulo: string;
  confirmar: string;
  minimo: number;
  destrutiva?: boolean;
  aoConfirmar: (texto: string) => void;
  children: ReactNode;
}) {
  const [texto, setTexto] = useState("");
  return (
    <AlertDialog onOpenChange={(aberto) => !aberto && setTexto("")}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{titulo}</AlertDialogTitle>
        <AlertDialogDescription>{descricao}</AlertDialogDescription>
        <Campo
          id="dialogo-texto"
          rotulo={rotulo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoComplete="off"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>{textos.comum.cancelar}</AlertDialogCancel>
          <AlertDialogAction
            disabled={texto.trim().length < minimo}
            className={destrutiva ? "bg-destructive hover:bg-destructive/90" : undefined}
            onClick={() => aoConfirmar(texto)}
          >
            {confirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
