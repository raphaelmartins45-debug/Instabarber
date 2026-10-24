import Link from "next/link";
import { TOM_CONTRATO } from "@/components/admin/comercial/contratos-lead";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { type ContratoComLead, listarContratos } from "@/lib/repositorios/comercial/contratos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial;
export const metadata = { title: `${t.contratos.titulo} · ${t.titulo}` };

const data = (d: string | null) => (d ? dataCurta(`${d}T12:00:00Z`) : textos.comum.vazio);

/** Todos os contratos (N.6). As ações fazem-se na ficha do lead. */
export default async function Contratos() {
  const contratos = await listarContratos(await criarClienteServidor());
  return (
    <TabelaCartoes<ContratoComLead>
      linhas={contratos}
      chave={(c) => c.id}
      vazio={t.contratos.vazio}
      testId="contrato-linha"
      colunas={[
        {
          id: "numero",
          rotulo: t.contratos.colunas.numero,
          valor: (c) => (
            <Link
              href={`/admin/comercial/leads/${c.lead_id}#contratos`}
              className="font-semibold text-ligacao underline"
            >
              {c.numero}
            </Link>
          ),
        },
        {
          id: "lead",
          rotulo: t.contratos.lead,
          valor: (c) => c.lead?.nome_barbearia || c.lead?.nome_contacto || textos.comum.vazio,
        },
        {
          id: "estado",
          rotulo: t.contratos.colunas.estado,
          valor: (c) => (
            <Etiqueta tom={TOM_CONTRATO[c.estado] ?? "neutro"}>
              {t.contratos.estados[c.estado]}
            </Etiqueta>
          ),
        },
        { id: "inicio", rotulo: t.contratos.colunas.inicio, valor: (c) => data(c.data_inicio) },
        { id: "assinado", rotulo: t.contratos.colunas.assinado, valor: (c) => data(c.assinado_em) },
      ]}
    />
  );
}
