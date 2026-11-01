"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apagar } from "@/app/(admin)/admin/(protegido)/equipa/acoes";
import { Aviso } from "@/components/nucleo/aviso";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.gestao.equipa;
const NINGUEM = "";

/**
 * Apagar uma pessoa da equipa (D-186): pede confirmação e, no mesmo quadro, para quem passam os
 * leads dela (outra pessoa ativa da equipa, ou ninguém).
 */
export function ApagarMembro({
  perfilId,
  nome,
  destinos,
}: {
  perfilId: string;
  nome: string;
  destinos: { userId: string; nome: string; papel: string }[];
}) {
  const router = useRouter();
  const [destino, setDestino] = useState(
    destinos.find((d) => d.papel === "comercial")?.userId ?? NINGUEM,
  );
  const [erro, setErro] = useState<string>();
  const [aApagar, iniciar] = useTransition();
  const confirmar = () =>
    iniciar(async () => {
      const r = await apagar(perfilId, destino || null);
      if (!r.ok) return setErro(t.erros[r.erro] ?? t.erros.generico);
      router.refresh();
    });
  return (
    <div className="grid gap-2">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-10 text-destructive"
            disabled={aApagar}
          >
            {t.apagar}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>{t.confirmarApagar.titulo(nome)}</AlertDialogTitle>
          <AlertDialogDescription>{t.confirmarApagar.texto}</AlertDialogDescription>
          <div className="grid gap-1.5">
            <Label htmlFor={`destino-${perfilId}`}>{t.confirmarApagar.leads}</Label>
            <select
              id={`destino-${perfilId}`}
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="h-11 rounded-md border bg-campo px-3 text-sm"
            >
              {destinos.map((d) => (
                <option key={d.userId} value={d.userId}>
                  {`${d.nome} · ${t.papeis[d.papel] ?? d.papel}`}
                </option>
              ))}
              <option value={NINGUEM}>{t.confirmarApagar.ninguem}</option>
            </select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{textos.comum.cancelar}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmar}
            >
              {t.confirmarApagar.confirmar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
