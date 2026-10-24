"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  aprovar,
  importarModeloBase,
  novaVersaoModelo,
} from "@/app/(admin)/admin/(protegido)/comercial/acoes-contratos";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import type { TipoModelo } from "@/lib/repositorios/comercial/contratos";

const t = textos.comercial.modelos;
const erroGenerico = textos.comercial.contratos.erros.generico!;

function useAcao() {
  const router = useRouter();
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: boolean }>) =>
    iniciar(async () => {
      const r = await acao();
      setErro(r.ok ? undefined : erroGenerico);
      if (r.ok) router.refresh();
    });
  return { erro, aGuardar, correr };
}

/** Importar o rascunho base de um tipo (docs/comercial), quando ainda não há nenhum modelo. */
export function ImportarModelo({ tipo }: { tipo: TipoModelo }) {
  const { erro, aGuardar, correr } = useAcao();
  return (
    <div className="grid gap-2">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <Button
        size="sm"
        variant="outline"
        disabled={aGuardar}
        onClick={() => correr(() => importarModeloBase(tipo))}
        className="justify-self-start"
      >
        {t.importar(t.tipos[tipo]!)}
      </Button>
    </div>
  );
}

/** Nova versão (a partir de qualquer modelo) e aprovar (só rascunho, com confirmação). */
export function AcoesModelo({ id, estado }: { id: string; estado: string }) {
  const { erro, aGuardar, correr } = useAcao();
  return (
    <div className="grid gap-2">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <div className="flex flex-wrap gap-2">
        {estado === "rascunho" ? (
          <ConfirmarAcao
            titulo={t.aprovarTitulo}
            descricao={t.aprovarTexto}
            confirmar={t.aprovar}
            destrutiva={false}
            aoConfirmar={() => correr(() => aprovar(id))}
          >
            <Button size="sm" disabled={aGuardar}>
              {t.aprovar}
            </Button>
          </ConfirmarAcao>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={aGuardar}
            onClick={() => correr(() => novaVersaoModelo(id))}
          >
            {t.novaVersao}
          </Button>
        )}
      </div>
    </div>
  );
}
