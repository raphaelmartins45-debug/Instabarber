"use client";

import { useId, useState } from "react";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textoErro } from "@/lib/adesao/erros";
import { dimensoes, temFundoBranco } from "@/lib/adesao/imagem-local";
import { textos } from "@/lib/i18n/pt-PT";
import { REGRAS_IMAGEM, verificarImagem, type TipoImagem } from "@/lib/regras/imagens";
import { criarClienteBrowser } from "@/lib/supabase/browser";

const t = textos.adesao.identidade;

/**
 * Escolhe uma imagem, verifica-a no browser (D.8.1), pede o URL assinado à rota e carrega-a
 * diretamente para o Storage. Devolve o caminho ao formulário.
 */
export function CarregadorImagem({
  tipo,
  posicao = 1,
  pasta,
  rotulo,
  ajuda,
  caminho,
  aoMudar,
  erro,
}: {
  tipo: TipoImagem;
  posicao?: number;
  pasta: string;
  rotulo: string;
  ajuda: string;
  caminho: string;
  aoMudar: (caminho: string) => void;
  erro?: string;
}) {
  const id = useId();
  const [previa, setPrevia] = useState<string>();
  const [problema, setProblema] = useState<string>();
  const [fundoBranco, setFundoBranco] = useState(false);
  const [aCarregar, setACarregar] = useState(false);

  async function escolher(ficheiro: File | undefined) {
    if (!ficheiro) return;
    setProblema(undefined);
    const medidas = await dimensoes(ficheiro).catch(() => null);
    const falha = verificarImagem(tipo, {
      formato: ficheiro.type,
      tamanho: ficheiro.size,
      ...medidas,
    });
    if (falha) return setProblema(textoErro(falha));
    setACarregar(true);
    try {
      const resposta = await fetch("/api/adesoes/carregamento", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tipo,
          posicao,
          formato: ficheiro.type,
          tamanho: ficheiro.size,
          pasta,
        }),
      });
      const corpo = (await resposta.json()) as { caminho?: string; token?: string; erro?: string };
      if (!resposta.ok || !corpo.caminho || !corpo.token) throw new Error(corpo.erro ?? "carregar");
      const { error } = await criarClienteBrowser()
        .storage.from("comercial")
        .uploadToSignedUrl(corpo.caminho, corpo.token, ficheiro, {
          contentType: ficheiro.type,
          upsert: true,
        });
      if (error) throw new Error("carregar");
      setFundoBranco(tipo === "logo" && (await temFundoBranco(ficheiro).catch(() => false)));
      setPrevia(URL.createObjectURL(ficheiro));
      aoMudar(corpo.caminho);
    } catch (e) {
      setProblema(textoErro(e instanceof Error && e.message === "limite" ? "limite" : "carregar"));
    } finally {
      setACarregar(false);
    }
  }

  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {rotulo}
      </label>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed bg-card p-3">
        {previa ? (
          // eslint-disable-next-line @next/next/no-img-element -- pré-visualização local (blob:)
          <img src={previa} alt="" className="size-16 rounded-md border object-contain" />
        ) : null}
        <input
          id={id}
          type="file"
          accept={REGRAS_IMAGEM[tipo].formatos.join(",")}
          className="sr-only"
          data-testid={`imagem-${tipo}${tipo === "galeria" ? `-${posicao}` : ""}`}
          onChange={(e) => escolher(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={aCarregar}
          onClick={() => document.getElementById(id)?.click()}
        >
          {t.escolher}
        </Button>
        {caminho ? <span className="text-sm text-sucesso">{t.carregado}</span> : null}
        {caminho && tipo !== "logo" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => (setPrevia(undefined), aoMudar(""))}
          >
            {t.remover}
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">{ajuda}</p>
      {fundoBranco ? <Aviso tipo="erro">{t.fundoBranco}</Aviso> : null}
      {problema || erro ? <p className="text-sm text-destructive">{problema ?? erro}</p> : null}
    </div>
  );
}
