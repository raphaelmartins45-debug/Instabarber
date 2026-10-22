"use client";

import { useState, useTransition } from "react";
import {
  acrescentarServico,
  ativarServico,
} from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes";
import { Campo } from "@/components/nucleo/campo";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { Button } from "@/components/ui/button";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { ServicoAdmin } from "@/lib/repositorios/admin/servicos";

const t = textos.admin.ficha.servicos;

/** Serviços da barbearia: lista, ativar e desativar, acrescentar (E.1). */
export function ServicosBarbearia({
  inquilinoId,
  servicos,
}: {
  inquilinoId: string;
  servicos: ServicoAdmin[];
}) {
  const [novo, setNovo] = useState({ nome: "", duracao_min: "30", preco: "" });
  const [erro, setErro] = useState(false);
  const [aGuardar, iniciar] = useTransition();
  return (
    <div className="grid gap-4">
      <TabelaCartoes<ServicoAdmin>
        linhas={servicos}
        chave={(s) => s.id}
        vazio={t.vazio}
        testId="servico"
        colunas={[
          { id: "nome", rotulo: t.nome, valor: (s) => s.nome },
          { id: "duracao", rotulo: t.duracao, valor: (s) => s.duracao_min },
          { id: "preco", rotulo: t.preco, valor: (s) => formatarDinheiro(s.preco_centimos) },
          {
            id: "ativo",
            rotulo: t.ativo,
            valor: (s) => (
              <input
                type="checkbox"
                aria-label={`${t.ativo}: ${s.nome}`}
                className="size-5"
                defaultChecked={s.ativo}
                onChange={(e) =>
                  iniciar(
                    async () => void (await ativarServico(inquilinoId, s.id, e.target.checked)),
                  )
                }
              />
            ),
          },
        ]}
      />
      <form
        className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_8rem_8rem_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          iniciar(async () => {
            const r = await acrescentarServico(inquilinoId, novo);
            setErro(!r.ok);
            if (r.ok) setNovo({ nome: "", duracao_min: "30", preco: "" });
          });
        }}
      >
        <Campo
          id="novo-servico"
          rotulo={t.nome}
          value={novo.nome}
          onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
        />
        <Campo
          id="nova-duracao"
          rotulo={t.duracao}
          inputMode="numeric"
          value={novo.duracao_min}
          onChange={(e) => setNovo({ ...novo, duracao_min: e.target.value })}
        />
        <Campo
          id="novo-preco"
          rotulo={t.preco}
          inputMode="decimal"
          value={novo.preco}
          onChange={(e) => setNovo({ ...novo, preco: e.target.value })}
        />
        <Button type="submit" className="h-11" disabled={aGuardar}>
          {t.acrescentar}
        </Button>
        {erro ? (
          <p className="text-sm text-destructive sm:col-span-4">{textos.comum.erroGuardar}</p>
        ) : null}
      </form>
    </div>
  );
}
