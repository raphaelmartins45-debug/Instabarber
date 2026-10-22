"use client";

import { useState, useTransition } from "react";
import { novaConta, paguei, remover } from "@/app/(app)/app/(painel)/financeiro/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Selecao } from "@/components/nucleo/selecao";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { Button } from "@/components/ui/button";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Conta } from "@/lib/repositorios/painel/financeiro";

const t = textos.financeiro.contas;

/** Custos fixos e despesas do mês, com «Paguei» e remover, e o formulário de nova conta (E.2). */
export function ContasMes({
  contas,
  hoje,
  editavel,
}: {
  contas: Conta[];
  hoje: string;
  editavel: boolean;
}) {
  const [v, setV] = useState({
    tipo: "custo",
    descricao: "",
    valor: "",
    data: hoje,
    recorrente: true,
    categoria: "",
  });
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const acrescentar = () =>
    iniciar(async () => {
      const r = await novaConta({ ...v, tipo: v.tipo as "custo" | "despesa" });
      if (r.ok) setV({ ...v, descricao: "", valor: "", categoria: "" });
      setErro(r.ok ? undefined : (textos.financeiro.erros[r.erro] ?? textos.comum.erroGuardar));
    });

  return (
    <div className="grid gap-4">
      <TabelaCartoes<Conta>
        linhas={contas}
        chave={(c) => `${c.tipo}-${c.id}`}
        vazio={t.vazio}
        testId="conta"
        colunas={[
          {
            id: "descricao",
            rotulo: t.colunas.descricao,
            valor: (c) => (
              <span>
                <span className="font-semibold">{c.descricao}</span>
                <span className="text-muted-foreground"> · {t.tipos[c.tipo]}</span>
              </span>
            ),
          },
          { id: "data", rotulo: t.colunas.data, valor: (c) => dataCurta(`${c.data}T12:00:00Z`) },
          { id: "valor", rotulo: t.colunas.valor, valor: (c) => formatarDinheiro(c.valorCent) },
          { id: "estado", rotulo: t.colunas.estado, valor: (c) => (c.pago ? t.pago : t.porPagar) },
          {
            id: "acoes",
            rotulo: t.colunas.acoes,
            valor: (c) =>
              editavel ? (
                <span className="flex flex-wrap justify-end gap-2 md:justify-start">
                  {!c.pago ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10"
                      disabled={aGuardar}
                      onClick={() => iniciar(async () => void (await paguei(c.tipo, c.id)))}
                    >
                      {t.paguei}
                    </Button>
                  ) : null}
                  <ConfirmarAcao
                    titulo={t.removerTitulo}
                    descricao={t.removerTexto}
                    confirmar={t.remover}
                    aoConfirmar={() => iniciar(async () => void (await remover(c.tipo, c.id)))}
                  >
                    <Button size="sm" variant="ghost" className="h-10">
                      {t.remover}
                    </Button>
                  </ConfirmarAcao>
                </span>
              ) : null,
          },
        ]}
      />
      {editavel ? (
        <form
          className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
          onSubmit={(e) => (e.preventDefault(), acrescentar())}
        >
          <h3 className="text-[15px] font-bold sm:col-span-2">{t.nova}</h3>
          <Selecao
            id="conta-tipo"
            rotulo={t.tipo}
            valor={v.tipo}
            aoMudar={(x) => setV({ ...v, tipo: x })}
            opcoes={Object.entries(t.tipos).map(([id, rotulo]) => ({ id, rotulo }))}
          />
          <Campo
            id="conta-descricao"
            rotulo={t.descricao}
            value={v.descricao}
            onChange={(e) => setV({ ...v, descricao: e.target.value })}
          />
          <Campo
            id="conta-valor"
            rotulo={t.valor}
            inputMode="decimal"
            value={v.valor}
            onChange={(e) => setV({ ...v, valor: e.target.value })}
          />
          <Campo
            id="conta-data"
            rotulo={v.tipo === "custo" ? t.vencimento : t.data}
            type="date"
            value={v.data}
            onChange={(e) => setV({ ...v, data: e.target.value })}
          />
          {v.tipo === "custo" ? (
            <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={v.recorrente}
                onChange={(e) => setV({ ...v, recorrente: e.target.checked })}
              />
              {t.recorrente}
            </label>
          ) : (
            <Campo
              id="conta-categoria"
              rotulo={t.categoria}
              value={v.categoria}
              onChange={(e) => setV({ ...v, categoria: e.target.value })}
            />
          )}
          {erro ? (
            <div className="sm:col-span-2">
              <Aviso tipo="erro">{erro}</Aviso>
            </div>
          ) : null}
          <Button
            type="submit"
            className="h-11 sm:col-span-2 sm:justify-self-start"
            disabled={aGuardar}
          >
            {t.acrescentar}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
