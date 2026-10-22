"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  eliminar,
  iniciarApoio,
  mudarEstado,
} from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { DialogoTexto } from "./dialogo-texto";

const t = textos.admin.ficha.acoes;
const a = textos.admin.ficha.apoio;

/** Ações rápidas da ficha: suspender, reativar, cancelar, exportar, eliminar e vista de apoio (E.1). */
export function AcoesBarbearia({ inquilinoId, estado }: { inquilinoId: string; estado: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const estadoNovo = (e: "ativo" | "suspenso" | "cancelado") =>
    iniciar(async () => {
      const r = await mudarEstado(inquilinoId, e);
      setErro(r.ok ? undefined : textos.comum.erroGuardar);
      router.refresh();
    });

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {estado === "ativo" ? (
          <ConfirmarAcao
            titulo={t.suspender}
            descricao={t.confirmarSuspender}
            confirmar={t.suspender}
            aoConfirmar={() => estadoNovo("suspenso")}
          >
            <Button variant="outline" className="h-11" disabled={aGuardar}>
              {t.suspender}
            </Button>
          </ConfirmarAcao>
        ) : null}
        {estado === "suspenso" || estado === "cancelado" ? (
          <ConfirmarAcao
            titulo={t.reativar}
            descricao={t.confirmarReativar}
            confirmar={t.reativar}
            destrutiva={false}
            aoConfirmar={() => estadoNovo("ativo")}
          >
            <Button variant="outline" className="h-11" disabled={aGuardar}>
              {t.reativar}
            </Button>
          </ConfirmarAcao>
        ) : null}
        {estado !== "cancelado" ? (
          <ConfirmarAcao
            titulo={t.cancelar}
            descricao={t.confirmarCancelar}
            confirmar={t.cancelar}
            aoConfirmar={() => estadoNovo("cancelado")}
          >
            <Button variant="outline" className="h-11 text-destructive" disabled={aGuardar}>
              {t.cancelar}
            </Button>
          </ConfirmarAcao>
        ) : null}
        <Button asChild variant="outline" className="h-11">
          <a href={`/admin/barbearias/${inquilinoId}/exportar`} download>
            {t.exportar}
          </a>
        </Button>
        <DialogoTexto
          titulo={t.exportarCliente}
          descricao={t.exportarClienteTexto}
          rotulo={t.telemovel}
          confirmar={t.exportarCliente}
          minimo={9}
          destrutiva={false}
          aoConfirmar={(telefone) =>
            window.location.assign(
              `/admin/barbearias/${inquilinoId}/exportar?telefone=${encodeURIComponent(telefone)}`,
            )
          }
        >
          <Button variant="outline" className="h-11">
            {t.exportarCliente}
          </Button>
        </DialogoTexto>
        <DialogoTexto
          titulo={a.titulo}
          descricao={a.texto}
          rotulo={a.justificacao}
          confirmar={a.abrir}
          minimo={10}
          aoConfirmar={(j) =>
            iniciar(async () => {
              const r = await iniciarApoio(inquilinoId, j);
              if (!r.ok) return setErro(a.erroJustificacao);
              window.location.assign("/app");
            })
          }
        >
          <Button variant="outline" className="h-11">
            {t.apoio}
          </Button>
        </DialogoTexto>
        {estado === "cancelado" ? (
          <DialogoTexto
            titulo={t.eliminarTitulo}
            descricao={t.eliminarTexto}
            rotulo={textos.admin.ficha.campos.slug}
            confirmar={t.eliminarBotao}
            minimo={3}
            destrutiva
            aoConfirmar={(slug) =>
              iniciar(async () => {
                const r = await eliminar(inquilinoId, slug);
                if (!r.ok) return setErro(t[r.erro as "slugErrado" | "soCancelada"]);
                router.push("/admin/barbearias");
              })
            }
          >
            <Button variant="destructive" className="h-11">
              {t.eliminar}
            </Button>
          </DialogoTexto>
        ) : null}
      </div>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
    </div>
  );
}
