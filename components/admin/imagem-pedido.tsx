"use client";

import { useState } from "react";
import { textos } from "@/lib/i18n/pt-PT";
import { REGRAS_IMAGEM, type TipoImagem } from "@/lib/regras/imagens";

const t = textos.admin.pedidos;

/** Uma imagem do pedido com as medidas reais e o aviso se estiver abaixo do mínimo (D.8.1). */
export function ImagemPedido({
  url,
  tipo,
  rotulo,
}: {
  url: string | null;
  tipo: TipoImagem;
  rotulo: string;
}) {
  const [medidas, setMedidas] = useState<{ l: number; a: number }>();
  const regra = REGRAS_IMAGEM[tipo];
  const abaixo = medidas && (medidas.l < regra.minLargura || medidas.a < regra.minAltura);
  return (
    <figure className="grid gap-1 rounded-lg border bg-card p-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL assinado temporário do Storage
        <img
          src={url}
          alt={rotulo}
          className="h-32 w-full rounded-md bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:16px_16px] object-contain"
          onLoad={(e) =>
            setMedidas({ l: e.currentTarget.naturalWidth, a: e.currentTarget.naturalHeight })
          }
        />
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          {t.semImagem}
        </div>
      )}
      <figcaption className="text-xs">
        <span className="font-semibold">{rotulo}</span>
        {medidas ? (
          <span className={abaixo ? "text-destructive" : "text-muted-foreground"}>
            {" "}
            · {t.medidas(medidas.l, medidas.a)}
            {abaixo ? ` · ${t.abaixoMinimo}` : ""}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
