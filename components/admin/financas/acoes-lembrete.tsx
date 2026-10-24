"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  abrirWhatsapp,
  cancelar,
  confirmarWhatsapp,
  enviarPorEmail,
  reenviarEmail,
} from "@/app/(admin)/admin/(protegido)/financas/acoes-vencimentos";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";

const t = textos.financas.vencimentos;

/**
 * O lembrete de uma barbearia (O.9): o texto proposto, editável; «WhatsApp» abre a conversa e
 * regista a ligação, e só «Confirmei o envio» o dá como enviado; «E-mail» envia no clique.
 */
export function AcoesLembrete({
  inquilinoId,
  textoProposto,
  whatsapp,
  email,
  lembrete,
}: {
  inquilinoId: string;
  textoProposto: string;
  whatsapp: string | null;
  email: string | null;
  lembrete: { id: string; canal: string; estado: string } | null;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState(textoProposto);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aCorrer, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: true } | { ok: false; erro: string }>, fim?: string) =>
    iniciar(async () => {
      const r = await acao();
      setAviso(
        r.ok
          ? fim
            ? { tipo: "sucesso", texto: fim }
            : undefined
          : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! },
      );
      router.refresh();
    });
  const enviarEmail = (acao: () => ReturnType<typeof enviarPorEmail>) =>
    iniciar(async () => {
      const r = await acao();
      setAviso(
        !r.ok
          ? { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.generico! }
          : r.enviado
            ? { tipo: "sucesso", texto: t.estados.enviado! }
            : { tipo: "erro", texto: t.estados.falhou! },
      );
      router.refresh();
    });
  const estado = lembrete?.estado;
  const id = `texto-${inquilinoId}`;
  return (
    <div className="grid gap-3">
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <div className="grid gap-1.5">
        <Label htmlFor={id} className="rotulo">
          {t.texto}
        </Label>
        <textarea
          id={id}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={6}
          className="rounded-md border bg-transparent p-3 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {whatsapp ? (
          <Button asChild size="sm" variant="outline">
            <a
              href={ligacaoWhatsApp(whatsapp, texto)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => correr(() => abrirWhatsapp(inquilinoId, texto))}
            >
              <MessageCircle className="size-4" aria-hidden />
              {t.whatsapp}
            </a>
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">{t.semWhatsapp}</span>
        )}
        {estado === "ligacao_aberta" && lembrete ? (
          <Button
            size="sm"
            disabled={aCorrer}
            onClick={() => correr(() => confirmarWhatsapp(lembrete.id))}
          >
            {t.confirmar}
          </Button>
        ) : null}
        {email ? (
          <Button
            size="sm"
            variant="outline"
            disabled={aCorrer}
            onClick={() => enviarEmail(() => enviarPorEmail(inquilinoId, texto))}
          >
            {t.email}
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">{t.semEmail}</span>
        )}
        {estado === "falhou" && lembrete ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={aCorrer}
            onClick={() => enviarEmail(() => reenviarEmail(lembrete.id))}
          >
            {t.repetir}
          </Button>
        ) : null}
        {lembrete && ["preparada", "ligacao_aberta", "falhou"].includes(lembrete.estado) ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={aCorrer}
            onClick={() => correr(() => cancelar(lembrete.id))}
          >
            {t.cancelar}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
