"use client";

import { useState, useTransition } from "react";
import { cancelar, faltou, lembreteAberto } from "@/app/(app)/app/(painel)/agenda/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { DialogoConcluir } from "./dialogo-concluir";

const t = textos.agenda;

/** Concluir, Faltou, lembrete e cancelar de uma marcação agendada (E.2, E.3). */
export function AcoesMarcacao({
  id,
  lembrete,
  lembreteAberto: jaAberto,
  podeFaltar,
}: {
  id: string;
  /** Ligação wa.me pronta; nula sem a funcionalidade ou sem telefone. */
  lembrete: string | null;
  lembreteAberto: boolean;
  podeFaltar: boolean;
}) {
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: true } | { ok: false; erro: string }>) =>
    iniciar(async () => {
      const r = await acao();
      setErro(r.ok ? undefined : (t.erros[r.erro] ?? t.erros.erro));
    });

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <DialogoConcluir id={id} />
        {podeFaltar ? (
          <ConfirmarAcao
            titulo={t.confirmarFalta.titulo}
            descricao={t.confirmarFalta.texto}
            confirmar={t.confirmarFalta.botao}
            aoConfirmar={() => correr(() => faltou(id))}
          >
            <Button variant="outline" size="sm" className="h-10" disabled={aGuardar}>
              {t.acoes.faltou}
            </Button>
          </ConfirmarAcao>
        ) : null}
        {lembrete ? (
          <Button asChild variant="outline" size="sm" className="h-10">
            <a
              href={lembrete}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void lembreteAberto(id)}
            >
              {jaAberto ? t.acoes.lembreteAberto : t.acoes.lembrete}
            </a>
          </Button>
        ) : null}
        <ConfirmarAcao
          titulo={t.confirmarCancelar.titulo}
          descricao={t.confirmarCancelar.texto}
          confirmar={t.confirmarCancelar.botao}
          aoConfirmar={() => correr(() => cancelar(id))}
        >
          <Button variant="ghost" size="sm" className="h-10" disabled={aGuardar}>
            {t.acoes.cancelar}
          </Button>
        </ConfirmarAcao>
      </div>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
    </div>
  );
}
