"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  guardarFuncionalidades,
  reporPacote,
} from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes-funcionalidades";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { estadoFuncionalidade } from "@/lib/admin/grelha";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

const t = textos.admin.funcionalidades;
type Item = { chave: string; nome: string; descricao: string | null; grupo: string };

/** A grelha D.3 de uma barbearia, por grupos, com o painel lateral de resumo (E.1). */
export function GrelhaFuncionalidades(props: {
  inquilinoId: string;
  catalogo: Item[];
  pacote: string[];
  ativasIniciais: string[];
  mensalidade: string;
}) {
  const router = useRouter();
  const [ativas, setAtivas] = useState(() => new Set(props.ativasIniciais));
  const [aviso, setAviso] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const pacote = useMemo(() => new Set(props.pacote), [props.pacote]);
  const grupos = Object.keys(t.grupos) as (keyof typeof t.grupos)[];
  const bonus = [...ativas].filter((c) => !pacote.has(c)).length;
  const alternar = (chave: string) =>
    setAtivas((s) => {
      const n = new Set(s);
      if (n.has(chave)) n.delete(chave);
      else n.add(chave);
      return n;
    });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
      <div className="grid gap-4">
        {grupos.map((g) => (
          <fieldset key={g} className="grid gap-2 rounded-lg border bg-card p-3">
            <legend className="px-1 text-[15px] font-bold text-ligacao">{t.grupos[g]}</legend>
            {props.catalogo
              .filter((f) => f.grupo === g)
              .map((f) => {
                const estado = estadoFuncionalidade(pacote.has(f.chave), ativas.has(f.chave));
                return (
                  <label
                    key={f.chave}
                    data-chave={f.chave}
                    className={cn(
                      "flex items-start gap-3 rounded-md p-2",
                      estado === "bonus" && "bg-accent",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-5"
                      checked={ativas.has(f.chave)}
                      onChange={() => alternar(f.chave)}
                    />
                    <span className="grid flex-1 gap-0.5">
                      <span className="text-sm font-semibold">{f.nome}</span>
                      {f.descricao ? (
                        <span className="text-xs text-muted-foreground">{f.descricao}</span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase",
                        estado === "bonus"
                          ? "bg-destaque text-primary"
                          : estado === "pacote"
                            ? "bg-muted"
                            : "text-muted-foreground",
                      )}
                    >
                      {t.estados[estado]}
                    </span>
                  </label>
                );
              })}
          </fieldset>
        ))}
      </div>
      <aside className="grid content-start gap-3 rounded-lg border bg-card p-4 lg:sticky lg:top-4">
        <h2 className="text-[15px] font-bold">{t.resumo}</h2>
        <p className="text-sm" data-testid="contador-ativas">
          {t.ativas(ativas.size, props.catalogo.length)}
        </p>
        <p className="text-sm text-muted-foreground">{t.bonus(bonus)}</p>
        <p className="text-sm">
          {textos.admin.ficha.mensalidade}: {props.mensalidade}
        </p>
        {aviso ? <Aviso tipo="sucesso">{aviso}</Aviso> : null}
        <Button
          className="h-11"
          disabled={aGuardar}
          onClick={() =>
            iniciar(async () => {
              const r = await guardarFuncionalidades({
                inquilinoId: props.inquilinoId,
                ativas: props.catalogo.map((f) => ({ chave: f.chave, ativa: ativas.has(f.chave) })),
              });
              setAviso(r.ok ? t.guardado : textos.comum.erroGuardar);
              router.refresh();
            })
          }
        >
          {t.guardar}
        </Button>
        <ConfirmarAcao
          titulo={t.repor}
          descricao={t.confirmarRepor}
          confirmar={t.repor}
          aoConfirmar={() =>
            iniciar(async () => {
              const r = await reporPacote(props.inquilinoId);
              if (r.ok) setAtivas(new Set(props.pacote));
              setAviso(r.ok ? t.reposto : textos.comum.erroGuardar);
              router.refresh();
            })
          }
        >
          <Button variant="outline" className="h-11" disabled={aGuardar}>
            {t.repor}
          </Button>
        </ConfirmarAcao>
      </aside>
    </div>
  );
}
