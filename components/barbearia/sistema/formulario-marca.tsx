"use client";

import { useEffect, useState, useTransition } from "react";
import { guardarSeccao } from "@/app/(app)/app/(painel)/sistema/acoes-configuracao";
import { Aviso } from "@/components/nucleo/aviso";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { paletaDePixeis } from "@/lib/regras/paleta";

const t = textos.sistema.marca;
const etiqueta = "text-[11px] font-semibold tracking-wide text-muted-foreground uppercase";

type Valores = {
  capa_cor: string;
  historia: string;
  mostrar_mapa: boolean;
  mostrar_historia: boolean;
};

/** Lê o logótipo num canvas e propõe as cores dominantes (só no browser; o servidor não decide). */
function usePaleta(logo: string | null): string[] {
  const [cores, setCores] = useState<string[]>([]);
  useEffect(() => {
    if (!logo) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 64, 64);
      try {
        setCores(paletaDePixeis(ctx.getImageData(0, 0, 64, 64).data));
      } catch {
        setCores([]);
      }
    };
    img.src = logo;
  }, [logo]);
  return cores;
}

export function FormularioMarca({
  nome,
  logo,
  inicial,
}: {
  nome: string;
  logo: string | null;
  inicial: Valores;
}) {
  const [v, setV] = useState(inicial);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const paleta = usePaleta(logo);
  const enviar = () =>
    iniciar(async () => {
      const r = await guardarSeccao("sistema_marca", v);
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: textos.comum.guardado }
          : { tipo: "erro", texto: textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar },
      );
    });
  return (
    <form className="grid max-w-2xl gap-4" onSubmit={(e) => (e.preventDefault(), enviar())}>
      <div className="grid gap-2">
        <label htmlFor="capa-cor" className={etiqueta}>
          {t.cor}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="capa-cor"
            type="color"
            value={v.capa_cor}
            onChange={(e) => setV({ ...v, capa_cor: e.target.value.toUpperCase() })}
            className="h-11 w-16 rounded-md border bg-card"
          />
          {paleta.length ? (
            <span className="text-xs text-muted-foreground">{t.paleta}:</span>
          ) : null}
          {paleta.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              aria-label={c}
              aria-pressed={v.capa_cor === c}
              onClick={() => setV({ ...v, capa_cor: c })}
              className="size-11 rounded-md border-2"
              style={{
                backgroundColor: c,
                borderColor: v.capa_cor === c ? "currentColor" : "transparent",
              }}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-1.5">
        <span className={etiqueta}>{t.preVisualizacao}</span>
        <div
          className="flex h-28 items-end rounded-xl p-4"
          style={{ backgroundColor: v.capa_cor }}
          data-testid="pre-visualizacao"
        >
          <span className="rounded-md bg-white/90 px-3 py-1.5 text-sm font-bold text-black">
            {nome}
          </span>
        </div>
      </div>
      <label className="grid gap-1.5">
        <span className={etiqueta}>{t.historia}</span>
        <textarea
          rows={4}
          maxLength={600}
          value={v.historia}
          onChange={(e) => setV({ ...v, historia: e.target.value })}
          className="rounded-md border bg-card px-3 py-2 text-sm"
        />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={v.mostrar_mapa}
          onChange={(e) => setV({ ...v, mostrar_mapa: e.target.checked })}
        />
        {t.mostrarMapa}
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={v.mostrar_historia}
          onChange={(e) => setV({ ...v, mostrar_historia: e.target.checked })}
        />
        {t.mostrarHistoria}
      </label>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      <Button
        type="submit"
        className="h-11 w-full sm:w-auto sm:justify-self-start"
        disabled={aGuardar}
      >
        {textos.comum.guardar}
      </Button>
    </form>
  );
}
