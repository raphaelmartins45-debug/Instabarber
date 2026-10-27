"use client";

import { useState, useTransition } from "react";
import {
  apagarPromocao,
  mudarPromocao,
  novaPromocao,
} from "@/app/(app)/app/(painel)/sistema/acoes-promocoes";
import { Aviso } from "@/components/nucleo/aviso";
import { Campo } from "@/components/nucleo/campo";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { diaCurtoNaLingua } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { Promocao } from "@/lib/repositorios/painel/promocoes";

const t = textos.sistema.promocoes;
const VAZIO = { titulo: "", descricao: "", inicio: "", fim: "" };

function datas(p: Promocao): string {
  const dia = (d: string) => diaCurtoNaLingua(d, "pt");
  if (p.inicio && p.fim) return t.entre(dia(p.inicio), dia(p.fim));
  if (p.inicio) return t.desde(dia(p.inicio));
  if (p.fim) return t.ate(dia(p.fim));
  return t.semDatas;
}

/** Lista e formulário das promoções (E.6): aparecem na página pública enquanto estão ativas. */
export function Promocoes({ promocoes }: { promocoes: Promocao[] }) {
  const [v, setV] = useState(VAZIO);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: true } | { ok: false; erro: string }>, ok?: string) =>
    iniciar(async () => {
      const r = await acao();
      setAviso(
        r.ok
          ? ok
            ? { tipo: "sucesso", texto: ok }
            : undefined
          : { tipo: "erro", texto: textos.sistema.erros[r.erro] ?? textos.comum.erroGuardar },
      );
      if (r.ok && ok) setV(VAZIO);
    });
  const campo = (nome: keyof typeof VAZIO, rotulo: string, tipo = "text") => (
    <Campo
      id={`promocao-${nome}`}
      rotulo={rotulo}
      type={tipo}
      value={v[nome]}
      onChange={(e) => setV({ ...v, [nome]: e.target.value })}
    />
  );
  return (
    <div className="grid gap-4">
      {promocoes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="grid gap-2">
          {promocoes.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
              data-testid="promocao"
            >
              <span className="grid min-w-0 gap-0.5">
                <span className="font-semibold">{p.titulo}</span>
                {p.descricao ? <span className="text-muted-foreground">{p.descricao}</span> : null}
                <span className="text-xs text-muted-foreground">{datas(p)}</span>
              </span>
              <span className="flex items-center gap-2">
                <label className="flex min-h-10 items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={p.ativa}
                    onChange={(e) => {
                      const ativa = e.target.checked;
                      correr(() => mudarPromocao(p.id, ativa));
                    }}
                  />
                  {t.ativa}
                </label>
                <ConfirmarAcao
                  titulo={t.removerTitulo}
                  descricao={t.removerTexto}
                  confirmar={t.remover}
                  aoConfirmar={() => correr(() => apagarPromocao(p.id))}
                >
                  <Button variant="ghost" size="sm" className="h-10">
                    {t.remover}
                  </Button>
                </ConfirmarAcao>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form
        className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2"
        onSubmit={(e) => (e.preventDefault(), correr(() => novaPromocao(v), t.criada))}
      >
        <h3 className="text-[15px] font-bold sm:col-span-2">{t.nova}</h3>
        {campo("titulo", t.titulo)}
        {campo("descricao", t.descricao)}
        {campo("inicio", t.inicio, "date")}
        {campo("fim", t.fim, "date")}
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
          {t.criar}
        </Button>
      </form>
    </div>
  );
}
