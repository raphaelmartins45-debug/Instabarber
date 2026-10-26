"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { aprovar } from "@/app/(admin)/admin/(protegido)/pedidos/acoes";
import { Aviso } from "@/components/nucleo/aviso";
import { ConfirmarAcao } from "@/components/nucleo/confirmar-acao";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.painel;
const p = textos.admin.pedidos;
const ERROS = {
  ja_decidido: p.jaDecidido,
  slug: textos.admin.ficha.erros.slug,
  profissionais: textos.admin.ficha.erros.profissionais,
  falhou: p.erroAprovar,
};

export type PedidoPendente = { id: string; nome: string; detalhe: string };

/**
 * Pedidos pendentes no painel geral (pedido do dono, 26/10/2026): a lista por baixo do número,
 * cada um com «Aprovar» ao lado. Aprova tal como foi pedido; para ajustar, abre-se o pedido.
 */
export function PedidosPendentes({ pedidos }: { pedidos: PedidoPendente[] }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ tipo: "erro" | "sucesso"; texto: string }>();
  const [aGuardar, iniciar] = useTransition();
  const aprovarPedido = (id: string) =>
    iniciar(async () => {
      const r = await aprovar(id, {});
      if (!r.ok) return setAviso({ tipo: "erro", texto: ERROS[r.erro] });
      setAviso({
        tipo: r.emailEnviado ? "sucesso" : "erro",
        texto: r.emailEnviado ? p.aprovado : p.aprovadoSemEmail,
      });
      router.refresh();
    });
  return (
    <section id="pedidos" className="grid gap-2" data-testid="painel-pedidos">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.pendentes}</h2>
        <Link href="/admin/pedidos" className="text-sm underline-offset-4 hover:underline">
          {t.verPedidos}
        </Link>
      </div>
      {aviso ? <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso> : null}
      {pedidos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.semPedidos}</p>
      ) : (
        <ul className="grid gap-2">
          {pedidos.map((x) => (
            <li
              key={x.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
              data-testid="painel-pedido"
            >
              <div className="grid min-w-0 gap-0.5">
                <Link
                  href={`/admin/pedidos/${x.id}`}
                  className="truncate font-semibold text-ligacao underline-offset-4 hover:underline"
                >
                  {x.nome}
                </Link>
                <span className="text-xs text-muted-foreground">{x.detalhe}</span>
              </div>
              <ConfirmarAcao
                titulo={p.aprovar}
                descricao={`${x.nome} · ${p.confirmarAprovar}`}
                confirmar={p.aprovar}
                aoConfirmar={() => aprovarPedido(x.id)}
                destrutiva={false}
              >
                <Button
                  className="h-11 shrink-0 bg-sucesso hover:bg-sucesso/90"
                  disabled={aGuardar}
                >
                  {p.aprovar}
                </Button>
              </ConfirmarAcao>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
