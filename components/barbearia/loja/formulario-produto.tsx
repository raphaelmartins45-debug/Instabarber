"use client";

import { useState, useTransition } from "react";
import { guardarProduto } from "@/app/(app)/app/(painel)/loja/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { Selecao } from "@/components/nucleo/selecao";
import { Button } from "@/components/ui/button";
import { centimosDeTexto, formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import {
  estadoStock,
  margemProduto,
  TAXA_IVA_LOJA_OMISSAO,
  TAXAS_IVA_LOJA,
} from "@/lib/regras/loja";
import type { Produto } from "@/lib/repositorios/painel/loja";
import { cn } from "@/lib/utils";

const t = textos.loja;

/** Produto da loja, com a margem calculada enquanto se escreve (sobre o preço sem IVA). */
export function FormularioProduto({ produto }: { produto: Produto | null }) {
  const [aberto, setAberto] = useState(!produto);
  const [v, setV] = useState({
    custo: produto ? textoDeCentimos(produto.custoCent) : "",
    preco: produto ? textoDeCentimos(produto.precoCent) : "",
    iva: String(produto?.ivaPercent ?? TAXA_IVA_LOJA_OMISSAO),
  });
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const custo = centimosDeTexto(v.custo);
  const preco = centimosDeTexto(v.preco);
  const margem =
    custo !== null && preco !== null ? margemProduto(custo, preco, Number(v.iva)) : null;
  const id = produto?.id ?? "novo";

  if (!aberto && produto) {
    const estado = estadoStock(produto.stock, produto.stockMinimo);
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
        data-testid="produto"
      >
        <span>
          <span className="font-semibold">{produto.nome}</span> ·{" "}
          {formatarDinheiro(produto.precoCent)} · {t.produto.stock}: {produto.stock}
        </span>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-semibold uppercase",
              estado === "esgotado"
                ? "bg-destructive/10 text-destructive"
                : estado === "repor"
                  ? "bg-accent text-ligacao"
                  : "bg-sucesso/15 text-sucesso",
            )}
          >
            {t.estadosStock[estado]}
          </span>
          <Button variant="outline" size="sm" className="h-10" onClick={() => setAberto(true)}>
            {t.produto.editar}
          </Button>
        </span>
      </div>
    );
  }

  return (
    <form
      action={(dados) =>
        iniciar(async () => {
          const r = await guardarProduto(dados);
          setAviso(
            r.ok
              ? { tipo: "sucesso", texto: t.produto.guardado }
              : { tipo: "erro", texto: t.erros[r.erro] ?? textos.comum.erroGuardar },
          );
        })
      }
      className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
    >
      {!produto ? <h3 className="text-[15px] font-bold sm:col-span-2">{t.produto.novo}</h3> : null}
      <input type="hidden" name="id" value={produto?.id ?? ""} />
      <Campo id={`p-${id}-nome`} name="nome" rotulo={t.produto.nome} defaultValue={produto?.nome} />
      <Campo
        id={`p-${id}-descricao`}
        name="descricao"
        rotulo={t.produto.descricao}
        defaultValue={produto?.descricao ?? ""}
      />
      <Campo
        id={`p-${id}-custo`}
        name="custo"
        rotulo={t.produto.custo}
        inputMode="decimal"
        value={v.custo}
        onChange={(e) => setV({ ...v, custo: e.target.value })}
      />
      <Campo
        id={`p-${id}-preco`}
        name="preco"
        rotulo={t.produto.preco}
        inputMode="decimal"
        value={v.preco}
        onChange={(e) => setV({ ...v, preco: e.target.value })}
      />
      <Selecao
        id={`p-${id}-iva`}
        rotulo={t.produto.iva}
        valor={v.iva}
        aoMudar={(x) => setV({ ...v, iva: x })}
        opcoes={TAXAS_IVA_LOJA.map((n) => ({ id: String(n), rotulo: `${n} %` }))}
      />
      <input type="hidden" name="iva" value={v.iva} />
      <p
        className={cn("self-end text-sm sm:col-span-1", margem?.negativa && "text-destructive")}
        data-testid="margem"
      >
        {margem
          ? t.produto.margem(
              formatarDinheiro(margem.semIvaCent),
              formatarDinheiro(margem.margemCent),
              formatarNumero(margem.percentagem),
            )
          : textos.comum.vazio}
        {margem?.negativa ? ` · ${t.produto.margemNegativa}` : ""}
      </p>
      <Campo
        id={`p-${id}-stock`}
        name="stock"
        rotulo={t.produto.stock}
        inputMode="numeric"
        defaultValue={String(produto?.stock ?? 0)}
      />
      <Campo
        id={`p-${id}-minimo`}
        name="stockMinimo"
        rotulo={t.produto.stockMinimo}
        inputMode="numeric"
        defaultValue={String(produto?.stockMinimo ?? 0)}
      />
      <label className="grid gap-1.5 text-sm sm:col-span-2">
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {t.produto.foto}
        </span>
        <input name="foto" type="file" accept="image/jpeg,image/webp" />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="ativo" defaultChecked={produto?.ativo ?? true} />
        {t.produto.ativo}
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="mostrarEsgotado"
          defaultChecked={produto?.mostrarEsgotado ?? true}
        />
        {t.produto.mostrarEsgotado}
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
        {t.produto.guardar}
      </Button>
    </form>
  );
}
