"use client";

import { useRef, useState, useTransition } from "react";
import { novaNotaTecnica } from "@/app/(app)/app/(painel)/clientes/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { Button } from "@/components/ui/button";
import { descreverFicheiro } from "@/lib/formatacao/ficheiros";
import { textos } from "@/lib/i18n/pt-PT";
import { FOTO_FICHA } from "@/lib/validacao/cliente";

const t = textos.clientes.tecnica;
const erros = textos.clientes.erros;
const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";
const ajudaFoto = descreverFicheiro({
  formatos: Object.keys(FOTO_FICHA.tipos),
  maxBytes: FOTO_FICHA.maxBytes,
});

export type ServicoParaLigar = { marcacaoId: string; rotulo: string };

/** Nova entrada do histórico de cortes (D-179): serviço, notas, fotografias e visibilidade. */
export function FormularioNotaTecnica({
  clienteId,
  consentimento,
  servicos,
}: {
  clienteId: string;
  /** O cliente já autorizou fotografias. */
  consentimento: boolean;
  /** Serviços concluídos deste cliente que ainda não têm entrada (o mais recente primeiro). */
  servicos: ServicoParaLigar[];
}) {
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
  const texto = (nome: string, rotulo: string, ajuda?: string) => (
    <label className="grid gap-1.5">
      <span className={etiqueta}>{rotulo}</span>
      <textarea
        name={nome}
        rows={2}
        maxLength={1000}
        className="rounded-md border bg-card px-3 py-2 text-sm"
      />
      {ajuda ? <span className="text-xs text-muted-foreground">{ajuda}</span> : null}
    </label>
  );

  return (
    <form
      ref={formulario}
      action={enviar}
      className="grid gap-3 rounded-lg border bg-card p-3"
      data-testid="nova-entrada-historico"
    >
      <h3 className="text-sm font-semibold">{t.nova}</h3>
      <input type="hidden" name="clienteId" value={clienteId} />
      <div className="grid gap-1.5">
        <label htmlFor={`servico-${clienteId}`} className={etiqueta}>
          {t.servico}
        </label>
        <select
          id={`servico-${clienteId}`}
          name="marcacaoId"
          defaultValue={servicos[0]?.marcacaoId ?? ""}
          className="h-11 w-full min-w-0 rounded-md border bg-card px-3 text-sm"
        >
          <option value="">{t.semServico}</option>
          {servicos.map((s) => (
            <option key={s.marcacaoId} value={s.marcacaoId}>
              {s.rotulo}
            </option>
          ))}
        </select>
      </div>
      {texto("nota", t.nota, t.notaAjuda)}
      {texto("notaCliente", t.notaCliente, t.notaClienteAjuda)}
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoFicheiro
          rotulo={t.foto}
          ajuda={ajudaFoto}
          accept="image/jpeg,image/png,image/webp"
          name="foto"
          imagem
        />
        <CampoFicheiro
          rotulo={t.foto2}
          ajuda={ajudaFoto}
          accept="image/jpeg,image/png,image/webp"
          name="foto2"
          imagem
        />
      </div>
      {consentimento ? (
        <p className="text-xs text-muted-foreground">{t.consentimentoDado}</p>
      ) : (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="consentimento" className="mt-0.5 size-4 accent-destaque" />
          <span>
            {t.consentimento}
            <span className="block text-xs text-muted-foreground">{t.consentimentoAjuda}</span>
          </span>
        </label>
      )}
      <label className="flex min-h-10 items-center gap-2 text-sm">
        <input type="checkbox" name="visivel" className="size-4 accent-destaque" />
        {t.visivel}
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
  );
}
