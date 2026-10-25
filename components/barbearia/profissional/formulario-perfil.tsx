"use client";

import { IMAGEM_PUBLICA } from "@/lib/repositorios/painel/imagens";
import { descreverFicheiro } from "@/lib/formatacao/ficheiros";
import { CampoFicheiro } from "@/components/nucleo/campo-ficheiro";
import { useState, useTransition } from "react";
import { guardarPerfil } from "@/app/(app)/app/(painel)/equipa/[id]/perfil/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.profissional.perfil;

/** Nome apresentado e fotografia do barbeiro (a que aparece na marcação pública). */
export function FormularioPerfil({
  profissionalId,
  nome,
  fotoUrl,
}: {
  profissionalId: string;
  nome: string;
  fotoUrl: string | null;
}) {
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const enviar = (dados: FormData) =>
    iniciar(async () => {
      const r = await guardarPerfil(dados);
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: t.guardado }
          : { tipo: "erro", texto: t.erros[r.erro] ?? t.erros.erro! },
      );
    });
  return (
    <form action={enviar} className="grid max-w-xl gap-3">
      <input type="hidden" name="profissionalId" value={profissionalId} />
      <Campo
        id="nome"
        name="nome"
        rotulo={t.nomeApresentado}
        ajuda={t.nomeAjuda}
        defaultValue={nome}
        maxLength={40}
      />
      <div className="flex items-center gap-3">
        {fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage, tamanho fixo
          <img src={fotoUrl} alt="" className="size-16 rounded-full border object-cover" />
        ) : null}
        <div className="min-w-0 flex-1">
          <CampoFicheiro
            rotulo={t.foto}
            ajuda={descreverFicheiro({
              formatos: ["image/jpeg", "image/png", "image/webp"],
              maxBytes: IMAGEM_PUBLICA.maxBytes,
            })}
            accept="image/jpeg,image/webp,image/png"
            name="foto"
            imagem
          />
        </div>
      </div>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <Button
        type="submit"
        className="h-11 w-full sm:w-auto sm:justify-self-start"
        disabled={aGuardar}
      >
        {t.guardar}
      </Button>
    </form>
  );
}
