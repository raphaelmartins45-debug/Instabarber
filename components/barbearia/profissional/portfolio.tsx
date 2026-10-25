"use client";

import { IMAGEM_PUBLICA } from "@/lib/repositorios/painel/imagens";
import { descreverFicheiro } from "@/lib/formatacao/ficheiros";
import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { useRef, useState, useTransition } from "react";
import {
  acrescentarAoPortfolio,
  removerDoPortfolio,
  tornarVisivel,
} from "@/app/(app)/app/(painel)/equipa/[id]/perfil/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import type { FotoPortfolio } from "@/lib/repositorios/painel/portfolio";

const t = textos.profissional.perfil;
const MAXIMO = 6;

/** «Os meus trabalhos» (F.4.6): até seis fotografias e o interruptor «Tornar visível». */
export function Portfolio({
  profissionalId,
  fotos,
  visivel,
}: {
  profissionalId: string;
  fotos: FotoPortfolio[];
  visivel: boolean;
}) {
  const formulario = useRef<HTMLFormElement>(null);
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const acrescentar = (dados: FormData) =>
    iniciar(async () => {
      const r = await acrescentarAoPortfolio(dados);
      if (r.ok) formulario.current?.reset();
      setErro(r.ok ? undefined : (t.erros[r.erro] ?? t.erros.erro));
    });
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">{t.portfolioAjuda}</p>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          defaultChecked={visivel}
          onChange={(e) => {
            const v = e.target.checked;
            iniciar(async () => void (await tornarVisivel(profissionalId, v)));
          }}
        />
        {t.tornarVisivel}
      </label>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fotos.map((f) => (
          <li key={f.id} className="grid gap-2 rounded-lg border bg-card p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage */}
            <img src={f.url} alt="" className="aspect-square w-full rounded-md object-cover" />
            <ConfirmarAcao
              titulo={t.remover}
              descricao={t.portfolio}
              confirmar={t.remover}
              aoConfirmar={() =>
                iniciar(async () => void (await removerDoPortfolio(profissionalId, f.id)))
              }
            >
              <Button variant="ghost" size="sm" className="h-10">
                {t.remover}
              </Button>
            </ConfirmarAcao>
          </li>
        ))}
      </ul>
      {fotos.length < MAXIMO ? (
        <form ref={formulario} action={acrescentar} className="grid gap-2">
          <input type="hidden" name="profissionalId" value={profissionalId} />
          <CampoFicheiro
            rotulo={t.acrescentarFoto}
            ajuda={descreverFicheiro({
              formatos: ["image/jpeg", "image/webp"],
              maxBytes: IMAGEM_PUBLICA.maxBytes,
            })}
            accept="image/jpeg,image/webp"
            name="foto"
            required
            imagem
          />
          <Button
            type="submit"
            variant="outline"
            className="h-11 justify-self-start"
            disabled={aGuardar}
          >
            {t.acrescentarFoto}
          </Button>
        </form>
      ) : null}
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
    </div>
  );
}
