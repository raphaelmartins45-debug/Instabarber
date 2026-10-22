"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Campo } from "@/components/nucleo/campo";
import { textoErro } from "@/lib/adesao/erros";
import { textos } from "@/lib/i18n/pt-PT";
import { MAXIMO_GALERIA_COM_CAPA } from "@/lib/regras/imagens";
import type { DadosPedidoAdesao } from "@/lib/validacao/adesao";
import { CarregadorImagem } from "./carregador-imagem";

const t = textos.adesao.identidade;

/** Passo 1: identidade da barbearia e imagens (D.8, D.8.1). */
export function PassoIdentidade({ pasta }: { pasta: string }) {
  const { register, setValue, control, formState } = useFormContext<DadosPedidoAdesao>();
  const e = formState.errors.identidade;
  const [logo = "", capa = "", galeria = []] = useWatch({
    control,
    name: ["identidade.logo_path", "identidade.capa_path", "identidade.galeria_paths"],
  });
  const lugaresGaleria = MAXIMO_GALERIA_COM_CAPA - 1;
  const mudarGaleria = (posicao: number, caminho: string) => {
    const lista = [...(galeria ?? [])];
    lista[posicao - 1] = caminho;
    setValue("identidade.galeria_paths", lista.filter(Boolean), { shouldValidate: true });
  };

  return (
    <div className="grid gap-4">
      <Campo
        id="nome"
        rotulo={t.nome}
        erro={textoErro(e?.nome?.message)}
        {...register("identidade.nome")}
      />
      <Campo
        id="responsavel"
        rotulo={t.responsavel}
        erro={textoErro(e?.responsavel?.message)}
        {...register("identidade.responsavel")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="nif"
          rotulo={t.nif}
          inputMode="numeric"
          maxLength={9}
          erro={textoErro(e?.nif?.message)}
          {...register("identidade.nif")}
        />
        <Campo
          id="ano"
          rotulo={t.ano}
          inputMode="numeric"
          maxLength={4}
          erro={textoErro(e?.ano_abertura?.message)}
          {...register("identidade.ano_abertura")}
        />
      </div>
      <Campo
        id="descricao"
        rotulo={t.descricao}
        ajuda={t.descricaoAjuda}
        erro={textoErro(e?.descricao?.message)}
        {...register("identidade.descricao")}
      />
      <CarregadorImagem
        tipo="logo"
        pasta={pasta}
        rotulo={t.logo}
        ajuda={t.logoAjuda}
        caminho={logo}
        aoMudar={(c) => setValue("identidade.logo_path", c, { shouldValidate: true })}
        erro={textoErro(e?.logo_path?.message)}
      />
      <CarregadorImagem
        tipo="capa"
        pasta={pasta}
        rotulo={t.capa}
        ajuda={t.capaAjuda}
        caminho={capa}
        aoMudar={(c) => setValue("identidade.capa_path", c)}
      />
      <div className="grid gap-3">
        {Array.from({ length: Math.min(lugaresGaleria, (galeria?.length ?? 0) + 1) }, (_, i) => (
          <CarregadorImagem
            key={i}
            tipo="galeria"
            posicao={i + 1}
            pasta={pasta}
            rotulo={i === 0 ? t.galeria : ""}
            ajuda={i === 0 ? t.galeriaAjuda : ""}
            caminho={galeria?.[i] ?? ""}
            aoMudar={(c) => mudarGaleria(i + 1, c)}
          />
        ))}
      </div>
    </div>
  );
}
