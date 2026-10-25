"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registarEvento } from "@/app/(admin)/admin/(protegido)/comercial/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoParaTelefone } from "@/lib/regras/whatsapp";

const t = textos.comercial.mensagens;

type Modelo = "primeiro" | "seguimento" | "proposta";

/**
 * Mensagens prontas para o lead (D-162): abre o WhatsApp com o texto; o envio confirma-se à mão
 * e fica no histórico (regra 7). A próxima ação do lead mantém-se.
 */
export function MensagensLead({
  leadId,
  nome,
  telefone,
  proposta,
  proximaAcao,
  proximaAcaoEm,
}: {
  leadId: string;
  nome: string;
  telefone: string | null;
  proposta: string | null;
  proximaAcao: string | null;
  proximaAcaoEm: string | null;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState<Modelo>();
  const [aviso, setAviso] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const textoDe = (m: Modelo) =>
    m === "proposta" ? t.textos.proposta(nome, proposta ?? "") : t.textos[m](nome);
  const modelos: Modelo[] = proposta
    ? ["primeiro", "seguimento", "proposta"]
    : ["primeiro", "seguimento"];
  if (!ligacaoParaTelefone(telefone, "x"))
    return <p className="text-sm text-muted-foreground">{t.semTelefone}</p>;
  return (
    <div className="grid gap-3" data-testid="mensagens-lead">
      <p className="text-xs text-muted-foreground">{t.ajuda}</p>
      {aviso ? <Aviso tipo="sucesso">{aviso}</Aviso> : null}
      <div className="flex flex-wrap gap-2">
        {modelos.map((m) => (
          <Button key={m} asChild size="sm" variant={aberto === m ? "default" : "outline"}>
            <a
              href={ligacaoParaTelefone(telefone, textoDe(m))!}
              target="_blank"
              rel="noreferrer"
              aria-label={t.abrir(t.modelos[m]!)}
              onClick={() => {
                setAberto(m);
                setAviso(undefined);
              }}
            >
              {t.modelos[m]}
            </a>
          </Button>
        ))}
      </div>
      {aberto ? (
        <Button
          type="button"
          size="sm"
          className="justify-self-start"
          disabled={aGuardar}
          onClick={() =>
            iniciar(async () => {
              const r = await registarEvento(leadId, {
                tipo: "mensagem",
                texto: t.eventoTexto(t.modelos[aberto]!),
                proxima_acao: proximaAcao ?? "",
                proxima_acao_em: proximaAcaoEm ?? "",
              });
              if (r.ok) {
                setAberto(undefined);
                setAviso(t.registado);
                router.refresh();
              }
            })
          }
        >
          {t.confirmar}
        </Button>
      ) : null}
    </div>
  );
}
