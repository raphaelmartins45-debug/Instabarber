"use client";

import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { useState, useTransition } from "react";
import {
  carregarImagemMarca,
  removerImagemMarca,
} from "@/app/(app)/app/(painel)/sistema/acoes-configuracao";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { REGRAS_IMAGEM, verificarImagem, type TipoImagem } from "@/lib/regras/imagens";

const t = textos.sistema.marca;
const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";
// A mesma explicação da adesão: formatos, tamanho, medidas e, no logótipo, o fundo transparente.
const a = textos.adesao.identidade;
const AJUDA: Record<TipoImagem, string> = {
  logo: a.logoAjuda,
  capa: a.capaAjuda,
  galeria: a.galeriaAjuda,
};

/** Dimensões da imagem no browser (o SVG não tem: fica por verificar). */
function dimensoes(ficheiro: File): Promise<{ largura?: number; altura?: number }> {
  if (ficheiro.type === "image/svg+xml") return Promise.resolve({});
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok({ largura: img.naturalWidth, altura: img.naturalHeight });
    img.onerror = () => ok({});
    img.src = URL.createObjectURL(ficheiro);
  });
}

/** Logótipo, fachada e galeria (D.8.1), com as mesmas regras da adesão. */
export function ImagensMarcaGestor({
  logo,
  capa,
  galeria,
}: {
  logo: string | null;
  capa: string | null;
  galeria: string[];
}) {
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const carregar = (tipo: TipoImagem, ficheiro: File | undefined) =>
    ficheiro &&
    iniciar(async () => {
      const d = await dimensoes(ficheiro);
      if (verificarImagem(tipo, { formato: ficheiro.type, tamanho: ficheiro.size, ...d }))
        return setErro(textos.sistema.erros.imagem);
      const dados = new FormData();
      dados.set("tipo", tipo);
      dados.set("imagem", ficheiro);
      const r = await carregarImagemMarca(dados);
      setErro(r.ok ? undefined : textos.sistema.erros.imagem);
    });
  const bloco = (tipo: TipoImagem, rotulo: string, urls: string[]) => (
    <div className="grid gap-2">
      <span className={etiqueta}>{rotulo}</span>
      <div className="flex flex-wrap gap-3">
        {urls.map((u) => (
          <div key={u} className="grid gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage */}
            <img src={u} alt="" className="size-28 rounded-md border bg-white object-contain" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10"
              disabled={aGuardar}
              onClick={() => iniciar(async () => void (await removerImagemMarca(tipo, u)))}
            >
              {t.remover}
            </Button>
          </div>
        ))}
      </div>
      <CampoFicheiro
        rotulo={urls.length ? textos.ficheiros.trocarImagem : rotulo}
        ajuda={AJUDA[tipo]}
        accept={REGRAS_IMAGEM[tipo].formatos.join(",")}
        imagem
        aCarregar={aGuardar}
        aoEscolher={(f) => carregar(tipo, f)}
        testId={`imagem-${tipo}`}
      />
    </div>
  );
  return (
    <div className="grid gap-4">
      {bloco("logo", t.logo, logo ? [logo] : [])}
      {bloco("capa", t.fachada, capa ? [capa] : [])}
      {bloco("galeria", t.galeria, galeria)}
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
    </div>
  );
}
