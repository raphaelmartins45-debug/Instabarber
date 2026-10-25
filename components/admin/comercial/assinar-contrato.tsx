"use client";

import { descreverFicheiro } from "@/lib/formatacao/ficheiros";
import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  prepararCarregamento,
  registarAssinatura,
} from "@/app/(admin)/admin/(protegido)/comercial/acoes-contratos";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { BUCKET_COMERCIAL } from "@/lib/repositorios/comercial/contratos";
import { criarClienteBrowser } from "@/lib/supabase/browser";

const t = textos.comercial.contratos;
const MAXIMO = 10 * 1024 * 1024;

/**
 * Registar a assinatura (N.6): assinado fora do sistema; o PDF assinado vai direto para o
 * Storage por URL assinado e só depois a base de dados marca «assinado» e o lead «ganho».
 */
export function AssinarContrato({ leadId, id }: { leadId: string; id: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const enviar = (form: FormData) =>
    iniciar(async () => {
      const data = String(form.get("data") ?? "");
      const ficheiro = form.get("ficheiro");
      if (!(ficheiro instanceof File) || !ficheiro.size)
        return setErro(t.erros.assinatura_incompleta);
      if (ficheiro.type !== "application/pdf" || ficheiro.size > MAXIMO)
        return setErro(t.erros.ficheiro);
      const p = await prepararCarregamento(leadId, id);
      if (!p.ok) return setErro(t.erros.generico);
      const { error } = await criarClienteBrowser()
        .storage.from(BUCKET_COMERCIAL)
        .uploadToSignedUrl(p.caminho, p.token, ficheiro, {
          contentType: "application/pdf",
          upsert: true,
        });
      if (error) return setErro(t.erros.generico);
      const r = await registarAssinatura(leadId, id, data, p.caminho);
      if (!r.ok) return setErro(t.erros[r.erro] ?? t.erros.generico);
      setErro(undefined);
      router.refresh();
    });
  return (
    <form action={enviar} className="grid gap-3 rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{t.assinarAjuda}</p>
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo
          id={`assinatura-data-${id}`}
          name="data"
          type="date"
          rotulo={t.dataAssinatura}
          required
        />
        <CampoFicheiro
          rotulo={t.ficheiroAssinado}
          ajuda={descreverFicheiro({ formatos: ["application/pdf"] })}
          accept="application/pdf"
          name="ficheiro"
          required
        />
      </div>
      <Button type="submit" size="sm" disabled={aGuardar} className="justify-self-start">
        {t.assinar}
      </Button>
    </form>
  );
}
