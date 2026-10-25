"use client";

import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { definirImagemMarca } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes";
import { Button } from "@/components/ui/button";
import { textoErro } from "@/lib/adesao/erros";
import { dimensoes } from "@/lib/adesao/imagem-local";
import { textos } from "@/lib/i18n/pt-PT";
import { extensaoDe, REGRAS_IMAGEM, verificarImagem, type TipoImagem } from "@/lib/regras/imagens";
import { criarClienteBrowser } from "@/lib/supabase/browser";

const t = textos.adesao.identidade;
type Imagem = {
  tipo: TipoImagem;
  campo: "logo_url" | "capa_foto_url" | "galeria";
  rotulo: string;
  ajuda: string;
  urls: string[];
};

/** Logótipo, capa e galeria da barbearia, com as regras da D.8.1, carregados pelo super_admin. */
export function ImagensMarca({
  inquilinoId,
  logo,
  capa,
  galeria,
}: {
  inquilinoId: string;
  logo: string | null;
  capa: string | null;
  galeria: string[];
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string>();
  const [aCarregar, iniciar] = useTransition();
  const imagens: Imagem[] = [
    {
      tipo: "logo",
      campo: "logo_url",
      rotulo: t.logo,
      ajuda: t.logoAjuda,
      urls: logo ? [logo] : [],
    },
    {
      tipo: "capa",
      campo: "capa_foto_url",
      rotulo: t.capa,
      ajuda: t.capaAjuda,
      urls: capa ? [capa] : [],
    },
    { tipo: "galeria", campo: "galeria", rotulo: t.galeria, ajuda: t.galeriaAjuda, urls: galeria },
  ];

  const carregar = (img: Imagem, ficheiro: File | undefined) =>
    ficheiro &&
    iniciar(async () => {
      setErro(undefined);
      const medidas = await dimensoes(ficheiro).catch(() => null);
      const falha = verificarImagem(img.tipo, {
        formato: ficheiro.type,
        tamanho: ficheiro.size,
        ...medidas,
      });
      if (falha) return setErro(textoErro(falha));
      const caminho = `${inquilinoId}/${img.tipo}-${Date.now()}.${extensaoDe(ficheiro.type)}`;
      const { error } = await criarClienteBrowser()
        .storage.from("publico")
        .upload(caminho, ficheiro, { contentType: ficheiro.type });
      if (error || !(await definirImagemMarca(inquilinoId, img.campo, caminho)).ok)
        return setErro(textoErro("carregar"));
      router.refresh();
    });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {imagens.map((img) => (
        <section key={img.tipo} className="grid content-start gap-2 rounded-lg border bg-card p-3">
          <h3 className="text-sm font-bold">{img.rotulo}</h3>
          <div className="flex flex-wrap gap-2">
            {img.urls.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
              <img key={u} src={u} alt="" className="size-20 rounded-md border object-contain" />
            ))}
          </div>
          <CampoFicheiro
            rotulo={
              img.urls.length ? textos.ficheiros.trocarImagem : textos.ficheiros.escolherImagem
            }
            ajuda={img.ajuda}
            accept={REGRAS_IMAGEM[img.tipo].formatos.join(",")}
            imagem
            aCarregar={aCarregar}
            aoEscolher={(f) => carregar(img, f)}
          />
          {img.urls.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-self-start"
              disabled={aCarregar}
              onClick={() =>
                iniciar(
                  async () => (
                    await definirImagemMarca(inquilinoId, img.campo, null), router.refresh()
                  ),
                )
              }
            >
              {t.remover}
            </Button>
          ) : null}
        </section>
      ))}
      {erro ? <p className="text-sm text-destructive md:col-span-3">{erro}</p> : null}
    </div>
  );
}
