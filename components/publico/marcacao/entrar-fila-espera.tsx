"use client";

import { useState, useTransition } from "react";
import { entrarNaFilaEspera } from "@/app/(publico)/b/[slug]/fila/acoes";
import { Button } from "@/components/ui/button";
import type { TextosPublicos } from "@/lib/i18n/publico";
import { FormularioContacto } from "../formulario-contacto";

/** Sem vagas no dia: entrar na fila de espera desse serviço e dia, nunca de uma hora (F.4.1). */
export function EntrarFilaEspera({
  t,
  slug,
  servicoId,
  dia,
  cliente,
}: {
  t: TextosPublicos;
  slug: string;
  servicoId: string;
  dia: string;
  cliente: { nome: string; telefone: string } | null;
}) {
  const f = t.fila;
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState<number | null>(null);
  const [erro, setErro] = useState<string>();
  const [aEnviar, iniciar] = useTransition();
  if (posicao !== null)
    return (
      <div className="grid gap-1 rounded-xl border bg-card p-4" data-testid="na-fila-espera">
        <p className="font-semibold">{f.naFila(posicao)}</p>
        <p className="text-sm text-muted-foreground">{f.naFilaAjuda}</p>
      </div>
    );
  if (!aberto)
    return (
      <div className="grid gap-2 rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">{f.entrarAjuda}</p>
        <Button variant="outline" className="h-11" onClick={() => setAberto(true)}>
          {f.entrar}
        </Button>
      </div>
    );
  return (
    <div className="rounded-xl border bg-card p-4">
      <FormularioContacto
        t={t}
        prefixo="fe"
        inicial={cliente ?? undefined}
        submeter={f.confirmar}
        erro={erro}
        aEnviar={aEnviar}
        aoEnviar={(c) =>
          iniciar(async () => {
            const r = await entrarNaFilaEspera(slug, servicoId, dia, c);
            if (r.ok) return setPosicao(r.posicao);
            setErro(t.marcacao.erros[r.erro] ?? t.marcacao.erros.erro);
          })
        }
      />
    </div>
  );
}
