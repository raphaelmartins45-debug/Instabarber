"use client";

import { useState, useTransition } from "react";
import { atribuir } from "@/app/(app)/app/(painel)/agenda/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Selecao } from "@/components/nucleo/selecao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.agenda.orfasSeccao;

/** Atribuir um profissional a uma marcação órfã; a base de dados volta a validar a vaga. */
export function AtribuirOrfa({
  id,
  opcoes,
}: {
  id: string;
  opcoes: { id: string; rotulo: string }[];
}) {
  const [profissional, setProfissional] = useState(opcoes[0]?.id ?? "");
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-48 flex-1">
          <Selecao
            id={`orfa-${id}`}
            rotulo={t.escolher}
            valor={profissional}
            aoMudar={setProfissional}
            opcoes={opcoes}
          />
        </div>
        <Button
          className="h-11"
          disabled={aGuardar || !profissional}
          onClick={() =>
            iniciar(async () => {
              const r = await atribuir(id, profissional);
              setErro(r.ok ? undefined : (textos.agenda.erros[r.erro] ?? textos.comum.erroGuardar));
            })
          }
        >
          {t.atribuir}
        </Button>
      </div>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
    </div>
  );
}
