"use client";

import { useState, useTransition } from "react";
import { anular, venderCartaoOferta } from "@/app/(app)/app/(painel)/sistema/acoes-clube";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Selecao } from "@/components/nucleo/selecao";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { Button } from "@/components/ui/button";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Cartao } from "@/lib/repositorios/painel/cartoes";

const t = textos.sistema.cartoes;

function estado(c: Cartao, hoje: string): string {
  if (c.anuladoEm) return "anulado";
  if (c.validoAte < hoje) return "expirado";
  return c.saldoCent > 0 ? "valido" : "usado";
}

export function CartoesOferta({
  cartoes,
  barbearia,
  corCapa,
  hoje,
}: {
  cartoes: Cartao[];
  barbearia: string;
  corCapa: string;
  hoje: string;
}) {
  const [v, setV] = useState({
    valor: "",
    comprador: "",
    beneficiario: "",
    metodo: "dinheiro",
    validoAte: "",
  });
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const pdf = async (c: Cartao) => {
    const { gerarCartaoOferta } = await import("@/lib/pdf/cartao-oferta");
    gerarCartaoOferta({
      barbearia,
      corCapa,
      codigo: c.codigo,
      valorCent: c.valorInicialCent,
      comprador: c.comprador,
      beneficiario: c.beneficiario,
      validoAte: dataCurta(`${c.validoAte}T12:00:00Z`),
    }).save(textos.sistema.pdfCartao.ficheiro(c.codigo));
  };
  const vender = () =>
    iniciar(async () => {
      const r = await venderCartaoOferta({ ...v, metodo: v.metodo as "dinheiro" });
      if (r.ok) setV({ ...v, valor: "", comprador: "", beneficiario: "" });
      setAviso(
        r.ok
          ? { tipo: "sucesso", texto: textos.comum.guardado }
          : { tipo: "erro", texto: textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar },
      );
    });

  return (
    <div className="grid gap-4">
      <TabelaCartoes<Cartao>
        linhas={cartoes}
        chave={(c) => c.id}
        vazio={t.vazio}
        testId="cartao-oferta"
        colunas={[
          {
            id: "codigo",
            rotulo: t.colunas.codigo,
            valor: (c) => <span className="font-mono font-semibold">{c.codigo}</span>,
          },
          { id: "comprador", rotulo: t.colunas.comprador, valor: (c) => c.comprador },
          {
            id: "valor",
            rotulo: t.colunas.valor,
            valor: (c) => formatarDinheiro(c.valorInicialCent),
          },
          { id: "saldo", rotulo: t.colunas.saldo, valor: (c) => formatarDinheiro(c.saldoCent) },
          {
            id: "validade",
            rotulo: t.colunas.validade,
            valor: (c) => dataCurta(`${c.validoAte}T12:00:00Z`),
          },
          { id: "estado", rotulo: t.colunas.estado, valor: (c) => t.estados[estado(c, hoje)] },
          {
            id: "acoes",
            rotulo: "",
            valor: (c) => (
              <span className="flex flex-wrap justify-end gap-2 md:justify-start">
                <Button size="sm" variant="outline" className="h-10" onClick={() => void pdf(c)}>
                  {t.pdf}
                </Button>
                {!c.anuladoEm ? (
                  <ConfirmarAcao
                    titulo={t.anularTitulo}
                    descricao={t.anularTexto}
                    confirmar={t.anular}
                    aoConfirmar={() => iniciar(async () => void (await anular(c.id)))}
                  >
                    <Button size="sm" variant="ghost" className="h-10">
                      {t.anular}
                    </Button>
                  </ConfirmarAcao>
                ) : null}
              </span>
            ),
          },
        ]}
      />
      <form
        className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
        onSubmit={(e) => (e.preventDefault(), vender())}
      >
        <h3 className="text-[15px] font-bold sm:col-span-2">{t.vender}</h3>
        <Campo
          id="cartao-valor"
          rotulo={t.valor}
          inputMode="decimal"
          value={v.valor}
          onChange={(e) => setV({ ...v, valor: e.target.value })}
        />
        <Campo
          id="cartao-comprador"
          rotulo={t.comprador}
          value={v.comprador}
          onChange={(e) => setV({ ...v, comprador: e.target.value })}
        />
        <Campo
          id="cartao-beneficiario"
          rotulo={t.beneficiario}
          value={v.beneficiario}
          onChange={(e) => setV({ ...v, beneficiario: e.target.value })}
        />
        <Selecao
          id="cartao-metodo"
          rotulo={t.metodo}
          valor={v.metodo}
          aoMudar={(x) => setV({ ...v, metodo: x })}
          opcoes={Object.entries(textos.sistema.metodos).map(([id, rotulo]) => ({ id, rotulo }))}
        />
        <Campo
          id="cartao-validade"
          rotulo={t.validade}
          type="date"
          value={v.validoAte}
          onChange={(e) => setV({ ...v, validoAte: e.target.value })}
        />
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
          {t.vender}
        </Button>
      </form>
    </div>
  );
}
