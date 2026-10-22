"use client";

import { useState, useTransition } from "react";
import {
  avisoAberto,
  cancelarPedido,
  levantado,
  marcarPronto,
} from "@/app/(app)/app/(painel)/loja/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { dataHora } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Pedido } from "@/lib/repositorios/painel/loja";

const t = textos.loja;

export type PedidoComAviso = Pedido & { aviso: { ligacao: string; conteudo: string } | null };

/** Pedidos: Novo → Pronto → Levantado, ou Cancelado (F.4.4). */
export function ListaPedidos({ pedidos }: { pedidos: PedidoComAviso[] }) {
  const [erro, setErro] = useState<string>();
  const [aGuardar, iniciar] = useTransition();
  const correr = (acao: () => Promise<{ ok: true } | { ok: false; erro: string }>) =>
    iniciar(async () => {
      const r = await acao();
      setErro(r.ok ? undefined : (t.erros[r.erro] ?? textos.comum.erroGuardar));
    });
  if (pedidos.length === 0)
    return <p className="text-sm text-muted-foreground">{t.pedidos.vazio}</p>;
  return (
    <div className="grid gap-2">
      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
      <ul className="grid gap-2">
        {pedidos.map((p) => (
          <li
            key={p.id}
            className="grid gap-2 rounded-lg border bg-card p-3 text-sm"
            data-testid="pedido"
            data-estado={p.estado}
          >
            <div className="flex flex-wrap justify-between gap-2">
              <span>
                <span className="font-semibold">{t.pedidos.numero(p.numero)}</span> · {p.cliente} ·{" "}
                {dataHora(p.criadoEm)}
              </span>
              <span className="font-semibold">
                {formatarDinheiro(p.totalCent)} · {t.estadosPedido[p.estado]}
              </span>
            </div>
            <ul className="text-muted-foreground">
              {p.linhas.map((l, i) => (
                <li key={i}>
                  {l.quantidade} × {l.produto} · {formatarDinheiro(l.precoCent)}
                </li>
              ))}
            </ul>
            {p.estado === "novo" || p.estado === "pronto" ? (
              <div className="flex flex-wrap gap-2">
                {p.estado === "novo" ? (
                  <Button
                    size="sm"
                    className="h-10"
                    disabled={aGuardar}
                    onClick={() => correr(() => marcarPronto(p.id))}
                  >
                    {t.pedidos.pronto}
                  </Button>
                ) : null}
                {p.estado === "pronto" && p.aviso ? (
                  <Button asChild size="sm" variant="outline" className="h-10">
                    <a
                      href={p.aviso.ligacao}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => void avisoAberto(p.id, p.clienteId, p.aviso!.conteudo)}
                    >
                      {t.pedidos.avisar}
                    </a>
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10"
                  disabled={aGuardar}
                  onClick={() => correr(() => levantado(p.id))}
                >
                  {t.pedidos.levantado}
                </Button>
                <ConfirmarAcao
                  titulo={t.pedidos.cancelarTitulo}
                  descricao={t.pedidos.cancelarTexto}
                  confirmar={t.pedidos.cancelar}
                  aoConfirmar={() => correr(() => cancelarPedido(p.id))}
                >
                  <Button size="sm" variant="ghost" className="h-10">
                    {t.pedidos.cancelar}
                  </Button>
                </ConfirmarAcao>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
