"use client";

import { useState, useTransition } from "react";
import { guardarServico } from "@/app/(app)/app/(painel)/sistema/acoes-configuracao";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Button } from "@/components/ui/button";
import { formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Servico } from "@/lib/repositorios/painel/servicos";

const t = textos.sistema.servicos;

/**
 * Um serviço, aberto para editar, ou o formulário de serviço novo. Com `multilinguagem`, os campos
 * de inglês e francês aparecem ao lado, sempre opcionais, com «copiar do português» (F.3.2).
 */
export function FormularioServico({
  servico,
  multilinguagem,
}: {
  servico: Servico | null;
  multilinguagem: boolean;
}) {
  const inicial = {
    nome: servico?.nome ?? "",
    nomeEn: servico?.nomeEn ?? "",
    nomeFr: servico?.nomeFr ?? "",
    descricao: servico?.descricao ?? "",
    descricaoEn: servico?.descricaoEn ?? "",
    descricaoFr: servico?.descricaoFr ?? "",
    duracaoMin: String(servico?.duracaoMin ?? 30),
    precoCent: servico ? textoDeCentimos(servico.precoCent) : "",
    ativo: servico?.ativo ?? true,
  };
  const [aberto, setAberto] = useState(!servico);
  const [v, setV] = useState(inicial);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const id = servico?.id ?? "novo";
  const campo = (nome: keyof typeof inicial, rotulo: string, modo?: "decimal" | "numeric") => (
    <Campo
      id={`servico-${id}-${nome}`}
      rotulo={rotulo}
      inputMode={modo}
      value={String(v[nome])}
      onChange={(e) => setV({ ...v, [nome]: e.target.value })}
    />
  );
  const enviar = () =>
    iniciar(async () => {
      const r = await guardarServico(servico?.id ?? null, v);
      if (r.ok && !servico) setV(inicial);
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: textos.comum.guardado }
          : { tipo: "erro", texto: textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar },
      );
    });

  if (!aberto && servico)
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
        data-testid="servico"
      >
        <span>
          <span className="font-semibold">{servico.nome}</span> · {servico.duracaoMin} min ·{" "}
          {formatarDinheiro(servico.precoCent)}
          {!servico.ativo ? (
            <span className="text-muted-foreground"> · {textos.sistema.equipa.inativo}</span>
          ) : null}
        </span>
        <Button variant="outline" size="sm" className="h-10" onClick={() => setAberto(true)}>
          {textos.loja.produto.editar}
        </Button>
      </div>
    );

  return (
    <form
      className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
      onSubmit={(e) => (e.preventDefault(), enviar())}
    >
      {!servico ? <h3 className="text-[15px] font-bold sm:col-span-2">{t.novo}</h3> : null}
      {campo("nome", t.nome)}
      {campo("descricao", t.descricao)}
      {campo("duracaoMin", t.duracao, "numeric")}
      {campo("precoCent", t.preco, "decimal")}
      {multilinguagem ? (
        <>
          {(["En", "Fr"] as const).map((l) => (
            <fieldset key={l} className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
              <legend className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {l === "En" ? t.ingles : t.frances}
              </legend>
              {campo(`nome${l}`, t.nome)}
              {campo(`descricao${l}`, t.descricao)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 justify-self-start"
                onClick={() => setV({ ...v, [`nome${l}`]: v.nome, [`descricao${l}`]: v.descricao })}
              >
                {t.copiar}
              </Button>
            </fieldset>
          ))}
        </>
      ) : null}
      <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={v.ativo}
          onChange={(e) => setV({ ...v, ativo: e.target.checked })}
        />
        {t.ativo}
      </label>
      {aviso ? (
        <div className="sm:col-span-2">
          <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
        </div>
      ) : null}
      <Button
        type="submit"
        className="h-11 sm:col-span-2 sm:justify-self-start"
        disabled={aGuardar}
      >
        {t.guardar}
      </Button>
    </form>
  );
}
