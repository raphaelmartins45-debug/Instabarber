"use client";

import { useState, useTransition } from "react";
import { mudarConsentimentoFotos } from "@/app/(publico)/b/[slug]/minha-area/acoes";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";

/** O cliente dá ou retira a autorização das fotografias do histórico de cortes (D-179). */
export type TextosConsentimentoFotos = {
  fotos: string;
  fotosSim: string;
  fotosAjuda: string;
  fotosRetirar: string;
  fotosRetirarTitulo: string;
  fotosRetirarTexto: string;
  fotosDar: string;
  fotosErro: string;
};

export function ConsentimentoFotos({
  t,
  inquilinoId,
  autorizado,
}: {
  /** Só textos (sem funções): o componente corre no browser. */
  t: TextosConsentimentoFotos;
  inquilinoId: string;
  autorizado: boolean;
}) {
  const [erro, setErro] = useState(false);
  const [aGuardar, iniciar] = useTransition();
  const mudar = (sim: boolean) =>
    iniciar(async () => setErro(!(await mudarConsentimentoFotos(inquilinoId, sim)).ok));
  return (
    <div className="grid gap-2 border-t pt-3 text-sm" data-testid="consentimento-fotos">
      <p className="font-semibold">{t.fotos}</p>
      <p className="text-muted-foreground">{t.fotosSim}</p>
      <p className="text-xs text-muted-foreground">{t.fotosAjuda}</p>
      {autorizado ? (
        <ConfirmarAcao
          titulo={t.fotosRetirarTitulo}
          descricao={t.fotosRetirarTexto}
          confirmar={t.fotosRetirar}
          aoConfirmar={() => mudar(false)}
        >
          <Button variant="outline" className="h-11 justify-self-start" disabled={aGuardar}>
            {t.fotosRetirar}
          </Button>
        </ConfirmarAcao>
      ) : (
        <Button
          variant="outline"
          className="h-11 justify-self-start"
          disabled={aGuardar}
          onClick={() => mudar(true)}
        >
          {t.fotosDar}
        </Button>
      )}
      {erro ? <p className="text-destructive">{t.fotosErro}</p> : null}
    </div>
  );
}
