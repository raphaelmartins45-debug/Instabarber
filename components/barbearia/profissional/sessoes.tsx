"use client";

import Link from "next/link";
import { useTransition } from "react";
import { terminarSessoes } from "@/app/(app)/app/(painel)/equipa/[id]/perfil/acoes";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.profissional.perfil;

/** Alterar palavra-passe (ecrã de definir, com a sessão) e terminar sessão em todos os dispositivos. */
export function Sessoes() {
  const [aSair, iniciar] = useTransition();
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" className="h-11">
        <Link href="/entrar/definir">{t.palavraPasse}</Link>
      </Button>
      <ConfirmarAcao
        titulo={t.terminarTitulo}
        descricao={t.terminarTexto}
        confirmar={t.terminarSessoes}
        aoConfirmar={() =>
          iniciar(async () => window.location.assign((await terminarSessoes()).destino))
        }
      >
        <Button variant="outline" className="h-11" disabled={aSair}>
          {t.terminarSessoes}
        </Button>
      </ConfirmarAcao>
    </div>
  );
}
