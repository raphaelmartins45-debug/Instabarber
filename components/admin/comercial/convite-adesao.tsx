"use client";

import { useState, useTransition } from "react";
import { criarConvite } from "@/app/(admin)/admin/(protegido)/comercial/acoes-contratos";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";

const t = textos.comercial.contratos;

/**
 * Convite de adesão (N.7): ligação de uso único com o formulário já preenchido. O código só se
 * mostra uma vez (a base de dados guarda o hash); o envio pelo WhatsApp é confirmado à mão.
 */
export function ConviteAdesao({
  leadId,
  id,
  nome,
  telefone,
}: {
  leadId: string;
  id: string;
  nome: string;
  telefone: string | null;
}) {
  const [ligacao, setLigacao] = useState<string>();
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const criar = () =>
    iniciar(async () => {
      const r = await criarConvite(leadId, id);
      if (!r.ok) return setErro(t.erros[r.erro] ?? t.erros.generico);
      setErro(undefined);
      setLigacao(r.ligacao);
    });
  const copiar = async () => {
    if (!ligacao) return;
    await navigator.clipboard.writeText(ligacao).catch(() => undefined);
    setCopiado(true);
  };
  const mensagem = ligacao ? t.textoConvite(nome, ligacao) : "";
  return (
    <div className="grid gap-2">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      {ligacao ? (
        <div className="grid gap-2 rounded-xl border p-3" data-testid="convite-ligacao">
          <p className="text-sm text-muted-foreground">{t.conviteCriado}</p>
          <code className="text-xs break-all">{ligacao}</code>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={copiar}>
              {copiado ? t.copiado : t.copiar}
            </Button>
            {telefone ? (
              <Button asChild size="sm" variant="ghost">
                <a href={ligacaoWhatsApp(telefone, mensagem)} target="_blank" rel="noreferrer">
                  {textos.comercial.propostas.enviarWhatsapp}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled={aGuardar}
          onClick={criar}
          className="justify-self-start"
        >
          {t.convite}
        </Button>
      )}
    </div>
  );
}
