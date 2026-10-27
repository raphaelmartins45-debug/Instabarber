"use client";

import { useTransition } from "react";
import { apagarNota, mostrarNota } from "@/app/(app)/app/(painel)/clientes/acoes";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { NotaTecnica } from "@/lib/repositorios/painel/historico-cortes";

const t = textos.clientes.tecnica;

/** Uma entrada do histórico de cortes: serviço, notas, fotografias e «visível ao cliente». */
export function EntradaHistorico({ n, podeApagar }: { n: NotaTecnica; podeApagar: boolean }) {
  const [aGuardar, iniciar] = useTransition();
  return (
    <li className="grid gap-2 rounded-lg border bg-card p-3 text-sm" data-testid="nota-tecnica">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {dataCurta(n.data)}
          {n.servico ? ` · ${n.servico}` : ""}
          {n.profissional ? ` · ${n.profissional}` : ""}
        </span>
        <span className="flex items-center gap-2">
          <label className="flex min-h-10 items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-destaque"
              defaultChecked={n.visivelCliente}
              disabled={aGuardar}
              onChange={(e) => {
                const visivel = e.target.checked;
                iniciar(async () => void (await mostrarNota(n.id, visivel)));
              }}
            />
            {t.visivelCurto}
          </label>
          {podeApagar ? (
            <ConfirmarAcao
              titulo={t.apagarTitulo}
              descricao={t.apagarTexto}
              confirmar={t.apagar}
              aoConfirmar={() => iniciar(async () => void (await apagarNota(n.id)))}
            >
              <Button variant="ghost" size="sm" className="h-10">
                {t.apagar}
              </Button>
            </ConfirmarAcao>
          ) : null}
        </span>
      </div>
      {n.nota ? (
        <p className="whitespace-pre-line">
          <span className="text-xs text-muted-foreground">{t.interna}: </span>
          {n.nota}
        </p>
      ) : null}
      {n.notaCliente ? (
        <p className="whitespace-pre-line">
          <span className="text-xs text-muted-foreground">{t.paraCliente}: </span>
          {n.notaCliente}
        </p>
      ) : null}
      {n.fotoUrls.length ? (
        <div className="grid grid-cols-2 gap-2">
          {n.fotoUrls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element -- URL assinado e temporário do bucket privado
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-square w-full rounded-md border object-cover"
            />
          ))}
        </div>
      ) : null}
    </li>
  );
}
