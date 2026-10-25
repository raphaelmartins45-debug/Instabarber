import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AcoesBarbearia } from "@/components/admin/acoes-barbearia";
import { NavSeparadores } from "@/components/admin/nav-separadores";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva, type Periodicidade, type Plano } from "@/lib/regras/mensalidade";
import { precoDaBarbearia } from "@/lib/regras/receita";
import { obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin;

/** Ficha do inquilino: cabeçalho, mensalidade (D.7), ações rápidas e os separadores (E.1 e o registo de apoio, D-160). */
export default async function FichaBarbearia({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const b = await obterBarbearia(await criarClienteServidor(), id);
  if (!b) notFound();
  const preco = precoDaBarbearia(b, lerRegimeIva(process.env.PRESTADORA_REGIME_IVA));
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-[22px] font-extrabold" data-testid="ficha-nome">
            {b.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.estados[b.estado as "ativo"]} · {t.planos[b.plano as Plano]} ·{" "}
            {t.periodicidades[b.periodicidade as Periodicidade]} ·{" "}
            <span data-testid="ficha-mensalidade">
              {t.ficha.mensalidade}: {formatarDinheiro(preco.comIva)} (
              {textos.adesao.contratacao.comIva}) · {formatarDinheiro(preco.semIva)} (
              {textos.adesao.contratacao.semIva})
              {Number(b.desconto_mensalidade_pct) > 0
                ? ` · ${t.ficha.comDesconto(Number(b.desconto_mensalidade_pct))}`
                : null}
            </span>
          </p>
        </div>
        <AcoesBarbearia inquilinoId={b.id} estado={b.estado} />
      </div>
      <NavSeparadores inquilinoId={b.id} />
      {children}
    </section>
  );
}
