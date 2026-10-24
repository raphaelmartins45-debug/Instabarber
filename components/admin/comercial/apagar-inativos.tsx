"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { apagarInativos } from "@/app/(admin)/admin/(protegido)/comercial/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial;

/** Rotina mensal do P-24: apagar os leads inativos há 12 meses, com confirmação. */
export function ApagarInativos() {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const apagar = () =>
    iniciar(async () => {
      const r = await apagarInativos();
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.leads.apagados(r.n) }
          : { tipo: "erro", texto: t.erros.generico! },
      );
      router.refresh();
    });
  return (
    <div className="grid gap-2">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <ConfirmarAcao
        titulo={t.leads.apagarTitulo}
        descricao={t.leads.apagarTexto}
        confirmar={t.leads.apagarInativos}
        aoConfirmar={apagar}
      >
        <Button variant="ghost" size="sm" disabled={aGuardar} className="justify-self-start">
          {t.leads.apagarInativos}
        </Button>
      </ConfirmarAcao>
    </div>
  );
}
