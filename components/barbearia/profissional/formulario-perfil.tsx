"use client";

import { useState, useTransition } from "react";
import { guardarPerfil } from "@/app/(app)/app/(painel)/equipa/[id]/perfil/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.profissional.perfil;
const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";

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
        <label className="grid gap-1.5">
          <span className={etiqueta}>{t.foto}</span>
          <input
            name="foto"
            type="file"
            accept="image/jpeg,image/webp,image/png"
            className="text-sm"
          />
        </label>
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
