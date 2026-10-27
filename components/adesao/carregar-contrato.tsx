"use client";

import { useState, useTransition } from "react";
import {
  confirmarCarregamentoCliente,
  prepararCarregamentoCliente,
} from "@/app/(adesao)/adesao/contrato/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { Button } from "@/components/ui/button";
import { descreverFicheiro } from "@/lib/formatacao/ficheiros";
import { textos } from "@/lib/i18n/pt-PT";
import { BUCKET_COMERCIAL } from "@/lib/repositorios/comercial/contratos";
import { criarClienteBrowser } from "@/lib/supabase/browser";

const t = textos.contratoCliente.pagina;
const MAXIMO = 10 * 1024 * 1024;

/** O cliente carrega o PDF assinado direto para o Storage, por URL assinado (D-181). */
export function CarregarContrato({ ligacao }: { ligacao: string }) {
  const [erro, setErro] = useState<string>();
  const [feito, setFeito] = useState(false);
  const [aCarregar, iniciar] = useTransition();
  if (feito) return <Aviso tipo="sucesso">{t.carregado}</Aviso>;
  const enviar = (form: FormData) =>
    iniciar(async () => {
      const ficheiro = form.get("ficheiro");
      if (!(ficheiro instanceof File) || ficheiro.type !== "application/pdf" || !ficheiro.size)
        return setErro(t.erros.ficheiro);
      if (ficheiro.size > MAXIMO) return setErro(t.erros.ficheiro);
      const p = await prepararCarregamentoCliente(ligacao);
      if (!p.ok)
        return setErro(p.erro === "invalida" ? t.invalida : (t.erros[p.erro] ?? t.erros.generico));
      const { error } = await criarClienteBrowser()
        .storage.from(BUCKET_COMERCIAL)
        .uploadToSignedUrl(p.caminho, p.token, ficheiro, {
          contentType: "application/pdf",
          upsert: true,
        });
      if (error) return setErro(t.erros.generico);
      const r = await confirmarCarregamentoCliente(ligacao);
      if (!r.ok) return setErro(t.erros.generico);
      setErro(undefined);
      setFeito(true);
    });
  return (
    <form action={enviar} className="grid gap-3" data-testid="carregar-contrato">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <CampoFicheiro
        rotulo={t.ficheiro}
        ajuda={descreverFicheiro({ formatos: ["application/pdf"] })}
        accept="application/pdf"
        name="ficheiro"
        required
        testId="contrato-ficheiro"
      />
      <Button type="submit" disabled={aCarregar} className="justify-self-start">
        {aCarregar ? t.aCarregar : t.carregar}
      </Button>
    </form>
  );
}
