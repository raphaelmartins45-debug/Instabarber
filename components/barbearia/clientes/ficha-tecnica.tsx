"use client";

import { useRef, useState, useTransition } from "react";
import { apagarNota, novaNotaTecnica } from "@/app/(app)/app/(painel)/clientes/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { dataHora } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { NotaTecnica } from "@/lib/repositorios/painel/ficha-cliente";

const t = textos.clientes.tecnica;
const erros = textos.clientes.erros;
const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";

/** Ficha técnica (F.4.14): notas e fotografias do corte, com data e barbeiro. Nunca dados de saúde. */
export function FichaTecnica({
  clienteId,
  notas,
  eGestor,
  userId,
}: {
  clienteId: string;
  notas: NotaTecnica[];
  /** O gestor apaga todas as notas; o barbeiro, as que escreveu (RLS fichas_apagar). */
  eGestor: boolean;
  userId: string;
}) {
  const podeApagar = (n: NotaTecnica) => eGestor || n.criadoPor === userId;
  const formulario = useRef<HTMLFormElement>(null);
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const enviar = (dados: FormData) =>
    iniciar(async () => {
      const r = await novaNotaTecnica(dados);
      if (r.ok) {
        formulario.current?.reset();
        setErro(undefined);
      } else setErro(erros[r.erro] ?? textos.comum.erroGuardar);
    });

  return (
    <div className="grid gap-3">
      <form ref={formulario} action={enviar} className="grid gap-3 rounded-lg border bg-card p-3">
        <input type="hidden" name="clienteId" value={clienteId} />
        <label className="grid gap-1.5">
          <span className={etiqueta}>{t.nota}</span>
          <textarea
            name="nota"
            rows={3}
            maxLength={1000}
            className="rounded-md border bg-card px-3 py-2 text-sm"
          />
          <span className="text-xs text-muted-foreground">{t.notaAjuda}</span>
        </label>
        <label className="grid gap-1.5">
          <span className={etiqueta}>{t.foto}</span>
          <input
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm"
          />
        </label>
        {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
        <Button
          type="submit"
          className="h-11 w-full sm:w-auto sm:justify-self-start"
          disabled={aGuardar}
        >
          {t.acrescentar}
        </Button>
      </form>
      {notas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="grid gap-2">
          {notas.map((n) => (
            <li
              key={n.id}
              className="grid gap-2 rounded-lg border bg-card p-3 text-sm"
              data-testid="nota-tecnica"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  {dataHora(n.criadoEm)}
                  {n.profissional ? ` · ${n.profissional}` : ""}
                </span>
                {podeApagar(n) ? (
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
              </div>
              {n.nota ? <p className="whitespace-pre-line">{n.nota}</p> : null}
              {n.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- URL assinado e temporário do bucket privado
                <img
                  src={n.fotoUrl}
                  alt=""
                  className="max-h-64 w-auto rounded-md border object-contain"
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
