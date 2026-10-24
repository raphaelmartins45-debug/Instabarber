import Link from "next/link";
import { TOM_PROPOSTA } from "@/components/admin/comercial/lista-propostas";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { listarPropostas, type PropostaComLead } from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial;
export const metadata = { title: `${t.propostas.titulo} · ${t.titulo}` };

/** Todas as propostas (N.5), com o estado efetivo (expirada calcula-se ao ler). */
export default async function Propostas() {
  const propostas = await listarPropostas(await criarClienteServidor());
  return (
    <TabelaCartoes<PropostaComLead>
      linhas={propostas}
      chave={(p) => p.id!}
      vazio={t.propostas.vazio}
      testId="proposta"
      colunas={[
        {
          id: "numero",
          rotulo: t.propostas.colunas.numero,
          valor: (p) => (
            <Link
              href={`/admin/comercial/leads/${p.lead_id}#propostas`}
              className="font-semibold text-ligacao underline"
            >
              {p.numero}
            </Link>
          ),
        },
        {
          id: "lead",
          rotulo: t.propostas.colunas.lead,
          valor: (p) => p.lead?.nome_barbearia || p.lead?.nome_contacto || textos.comum.vazio,
        },
        {
          id: "plano",
          rotulo: t.propostas.colunas.plano,
          valor: (p) => t.briefing.planos[p.plano ?? ""],
        },
        {
          id: "valor",
          rotulo: t.propostas.colunas.valor,
          valor: (p) => formatarDinheiro(centimosDeNumeric(String(p.valor_periodo_com_iva))),
        },
        {
          id: "estado",
          rotulo: t.propostas.colunas.estado,
          valor: (p) => {
            const e = p.estado_efetivo ?? "rascunho";
            return <Etiqueta tom={TOM_PROPOSTA[e] ?? "neutro"}>{t.propostas.estados[e]}</Etiqueta>;
          },
        },
        {
          id: "validade",
          rotulo: t.propostas.colunas.validade,
          valor: (p) =>
            p.valida_ate ? dataCurta(`${p.valida_ate}T12:00:00Z`) : textos.comum.vazio,
        },
      ]}
    />
  );
}
