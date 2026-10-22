"use client";

import { useState, useTransition } from "react";
import {
  aplicarModeloATodos,
  guardarFichaBarbeiro,
  mudarAcessoBarbeiro,
} from "@/app/(app)/app/(painel)/sistema/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Selecao } from "@/components/nucleo/selecao";
import { Button } from "@/components/ui/button";
import { formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { HorarioBarbeiro, type FaixaHorario } from "./horario-barbeiro";

const t = textos.sistema.equipa;

type Ficha = {
  id: string;
  nome: string;
  ativo: boolean;
  comissao: string;
  modelo: "A" | "B" | "C";
  rendaCent: number | null;
  rendaDia: number | null;
};

/** A ficha de um barbeiro na Gestão do sistema (E.2). */
export function FichaBarbeiro({
  ficha,
  servicos,
  comissoes,
  horario,
}: {
  ficha: Ficha;
  servicos: { id: string; nome: string; precoCent: number }[];
  comissoes: Record<string, number>;
  horario: FaixaHorario[];
}) {
  const [v, setV] = useState({
    comissao: ficha.comissao,
    modelo: ficha.modelo as string,
    renda: ficha.rendaCent === null ? "" : textoDeCentimos(ficha.rendaCent),
    rendaDia: ficha.rendaDia === null ? "" : String(ficha.rendaDia),
    porServico: Object.fromEntries(
      servicos.map((s) => [s.id, comissoes[s.id] === undefined ? "" : String(comissoes[s.id])]),
    ),
  });
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (
    acao: () => Promise<{ ok: true } | { ok: false; erro: string }>,
    sucesso: string,
  ) =>
    iniciar(async () => {
      const r = await acao();
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: sucesso }
          : { tipo: "erro", texto: textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar },
      );
    });
  const euros = (pct: string, precoCent: number) => {
    const n = Number((pct || v.comissao).replace(",", "."));
    return Number.isFinite(n)
      ? formatarDinheiro(Math.round((precoCent * n) / 100))
      : textos.comum.vazio;
  };

  return (
    <section
      className="grid gap-4 rounded-xl border bg-card p-4"
      aria-labelledby="ficha-barbeiro"
      data-testid="ficha-barbeiro"
    >
      <h3 id="ficha-barbeiro" className="text-[15px] font-bold">
        {t.ficha} · {ficha.nome}
      </h3>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => (
          e.preventDefault(),
          correr(
            () => guardarFichaBarbeiro(ficha.id, { ...v, modelo: v.modelo as "A" }),
            textos.comum.guardado,
          )
        )}
      >
        <Campo
          id="ficha-comissao"
          rotulo={t.comissao}
          ajuda={t.comissaoAjuda}
          inputMode="decimal"
          value={v.comissao}
          onChange={(e) => setV({ ...v, comissao: e.target.value })}
        />
        <div className="grid gap-2">
          <Selecao
            id="ficha-modelo"
            rotulo={t.modelo}
            valor={v.modelo}
            aoMudar={(x) => setV({ ...v, modelo: x })}
            opcoes={Object.entries(t.modelos).map(([id, rotulo]) => ({ id, rotulo }))}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 justify-self-start"
            disabled={aGuardar}
            onClick={() => correr(() => aplicarModeloATodos(v.modelo), t.aplicado)}
          >
            {t.aplicarTodos}
          </Button>
        </div>
        {v.modelo === "C" ? (
          <>
            <Campo
              id="ficha-renda"
              rotulo={t.renda}
              inputMode="decimal"
              value={v.renda}
              onChange={(e) => setV({ ...v, renda: e.target.value })}
            />
            <Campo
              id="ficha-renda-dia"
              rotulo={t.rendaDia}
              inputMode="numeric"
              value={v.rendaDia}
              onChange={(e) => setV({ ...v, rendaDia: e.target.value })}
            />
          </>
        ) : null}
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {t.porServico}
          </legend>
          <p className="text-xs text-muted-foreground">{t.porServicoAjuda}</p>
          {servicos.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 text-sm">
              <label htmlFor={`pct-${s.id}`} className="min-w-28 flex-1">
                {s.nome}
              </label>
              <input
                id={`pct-${s.id}`}
                inputMode="decimal"
                placeholder={v.comissao}
                className="h-11 w-24 rounded-md border bg-card px-3"
                value={v.porServico[s.id] ?? ""}
                onChange={(e) =>
                  setV({ ...v, porServico: { ...v.porServico, [s.id]: e.target.value } })
                }
              />
              <span className="text-muted-foreground">
                {t.valorEuros(euros(v.porServico[s.id] ?? "", s.precoCent))}
              </span>
            </div>
          ))}
        </fieldset>
        <Button
          type="submit"
          className="h-11 sm:col-span-2 sm:justify-self-start"
          disabled={aGuardar}
        >
          {textos.comum.guardar}
        </Button>
      </form>
      <HorarioBarbeiro id={ficha.id} inicial={horario} />
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      {ficha.ativo ? (
        <ConfirmarAcao
          titulo={t.desativarTitulo}
          descricao={t.desativarTexto}
          confirmar={t.desativar}
          aoConfirmar={() =>
            correr(() => mudarAcessoBarbeiro(ficha.id, false), textos.comum.guardado)
          }
        >
          <Button variant="outline" className="h-11 justify-self-start text-destructive">
            {t.desativar}
          </Button>
        </ConfirmarAcao>
      ) : (
        <Button
          variant="outline"
          className="h-11 justify-self-start"
          disabled={aGuardar}
          onClick={() => correr(() => mudarAcessoBarbeiro(ficha.id, true), textos.comum.guardado)}
        >
          {t.repor}
        </Button>
      )}
    </section>
  );
}
