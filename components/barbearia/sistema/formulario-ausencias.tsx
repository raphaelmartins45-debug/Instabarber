"use client";

import { useState, useTransition } from "react";
import {
  apagarAusencia,
  apagarFeriado,
  novaAusencia,
  novoFeriado,
} from "@/app/(app)/app/(painel)/sistema/acoes-configuracao";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Selecao } from "@/components/nucleo/selecao";
import { Button } from "@/components/ui/button";
import { dataCurta, dataHora } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.sistema.ausencias;

export type LinhaAusencia = {
  id: string;
  quem: string;
  tipo: string;
  inicio: string;
  fim: string;
  motivo: string | null;
};
export type LinhaFeriado = { id: string; data: string; nome: string };

export function FormularioAusencias({
  ausencias,
  feriados,
  profissionais,
  hoje,
}: {
  ausencias: LinhaAusencia[];
  feriados: LinhaFeriado[];
  profissionais: { id: string; rotulo: string }[];
  hoje: string;
}) {
  const [a, setA] = useState({
    profissionalId: "",
    tipo: "ferias",
    inicio: `${hoje}T09:00`,
    fim: `${hoje}T19:30`,
    motivo: "",
  });
  const [f, setF] = useState({ data: hoje, nome: "" });
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: true } | { ok: false; erro: string }>) =>
    iniciar(async () => {
      const r = await acao();
      setErro(r.ok ? undefined : (textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar));
    });
  const remover = (
    titulo: string,
    acao: () => Promise<{ ok: true } | { ok: false; erro: string }>,
  ) => (
    <ConfirmarAcao
      titulo={titulo}
      descricao={titulo}
      confirmar={t.remover}
      aoConfirmar={() => correr(acao)}
    >
      <Button variant="ghost" size="sm" className="h-10">
        {t.remover}
      </Button>
    </ConfirmarAcao>
  );
  const linha =
    "flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm";

  return (
    <div className="grid gap-6">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      {ausencias.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="grid gap-2">
          {ausencias.map((x) => (
            <li key={x.id} className={linha}>
              <span>
                <span className="font-semibold">{x.quem}</span> ·{" "}
                {textos.agenda.tiposAusencia[x.tipo]} · {dataHora(x.inicio)} – {dataHora(x.fim)}
                {x.motivo ? ` · ${x.motivo}` : ""}
              </span>
              {remover(`${t.remover}: ${x.quem}`, () => apagarAusencia(x.id))}
            </li>
          ))}
        </ul>
      )}
      <form
        className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
        onSubmit={(e) => (
          e.preventDefault(), correr(() => novaAusencia({ ...a, tipo: a.tipo as "ferias" }))
        )}
      >
        <h3 className="text-[15px] font-bold sm:col-span-2">{t.nova}</h3>
        <Selecao
          id="ausencia-quem"
          rotulo={t.quem}
          valor={a.profissionalId}
          aoMudar={(x) => setA({ ...a, profissionalId: x })}
          opcoes={[{ id: "", rotulo: t.barbearia }, ...profissionais]}
        />
        <Selecao
          id="ausencia-tipo"
          rotulo={t.tipo}
          valor={a.tipo}
          aoMudar={(x) => setA({ ...a, tipo: x })}
          opcoes={Object.entries(textos.agenda.tiposAusencia).map(([id, rotulo]) => ({
            id,
            rotulo,
          }))}
        />
        <Campo
          id="ausencia-inicio"
          rotulo={t.inicio}
          type="datetime-local"
          value={a.inicio}
          onChange={(e) => setA({ ...a, inicio: e.target.value })}
        />
        <Campo
          id="ausencia-fim"
          rotulo={t.fim}
          type="datetime-local"
          value={a.fim}
          onChange={(e) => setA({ ...a, fim: e.target.value })}
        />
        <div className="sm:col-span-2">
          <Campo
            id="ausencia-motivo"
            rotulo={t.motivo}
            value={a.motivo}
            onChange={(e) => setA({ ...a, motivo: e.target.value })}
          />
        </div>
        <Button
          type="submit"
          className="h-11 sm:col-span-2 sm:justify-self-start"
          disabled={aGuardar}
        >
          {t.acrescentar}
        </Button>
      </form>
      <section className="grid gap-3">
        <h3 className="text-[15px] font-bold">{t.feriadosTitulo}</h3>
        <p className="text-sm text-muted-foreground">{t.feriadosAjuda}</p>
        {feriados.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.semFeriados}</p>
        ) : (
          <ul className="grid gap-2">
            {feriados.map((x) => (
              <li key={x.id} className={linha}>
                <span>
                  {dataCurta(`${x.data}T12:00:00Z`)} · {x.nome}
                </span>
                {remover(`${t.remover}: ${x.nome}`, () => apagarFeriado(x.id))}
              </li>
            ))}
          </ul>
        )}
        <form
          className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
          onSubmit={(e) => (e.preventDefault(), correr(() => novoFeriado(f)))}
        >
          <Campo
            id="feriado-data"
            rotulo={t.feriadoData}
            type="date"
            value={f.data}
            onChange={(e) => setF({ ...f, data: e.target.value })}
          />
          <Campo
            id="feriado-nome"
            rotulo={t.feriadoNome}
            value={f.nome}
            onChange={(e) => setF({ ...f, nome: e.target.value })}
          />
          <Button
            type="submit"
            variant="outline"
            className="h-11 sm:col-span-2 sm:justify-self-start"
            disabled={aGuardar}
          >
            {t.acrescentarFeriado}
          </Button>
        </form>
      </section>
    </div>
  );
}
