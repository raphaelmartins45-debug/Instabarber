import Link from "next/link";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { listarPedidos, type PedidoAdesaoLinha } from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.pedidos;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Pedidos de adesão pendentes, com plano, profissionais, mensalidade e pagamento em destaque (E.1). */
export default async function Pedidos() {
  const pedidos = await listarPedidos(await criarClienteServidor());
  return (
    <section className="grid gap-4">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <TabelaCartoes<PedidoAdesaoLinha>
        linhas={pedidos}
        chave={(p) => p.id}
        vazio={t.vazio}
        testId="pedido"
        colunas={[
          {
            id: "barbearia",
            rotulo: t.colunas.barbearia,
            valor: (p) => (
              <Link
                href={`/admin/pedidos/${p.id}`}
                className="font-semibold text-ligacao underline"
              >
                {p.nome}
              </Link>
            ),
          },
          {
            id: "plano",
            rotulo: t.colunas.plano,
            valor: (p) => textos.admin.planos[p.plano as "basic" | "pro"],
          },
          { id: "profissionais", rotulo: t.colunas.profissionais, valor: (p) => p.profissionais },
          {
            id: "mensalidade",
            rotulo: t.colunas.mensalidade,
            valor: (p) => formatarDinheiro(centimosDeNumeric(p.mensalidade_calculada)),
          },
          {
            id: "pagamento",
            rotulo: t.colunas.pagamento,
            valor: (p) =>
              p.preferencia_pagamento
                ? textos.adesao.contratacao.pagamentos[p.preferencia_pagamento as "mbway"]
                : textos.comum.vazio,
          },
          { id: "submetido", rotulo: t.colunas.submetido, valor: (p) => dataCurta(p.submetido_em) },
        ]}
      />
    </section>
  );
}
