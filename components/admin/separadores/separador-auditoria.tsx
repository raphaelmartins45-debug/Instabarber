import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataHora } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarAuditoria, type RegistoAuditoria } from "@/lib/repositorios/admin/auditoria";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.ficha.auditoria;

/** Registos de auditoria de uma barbearia, ou os mais recentes de todas (E.1, H.1). */
export async function SeparadorAuditoria({
  inquilinoId,
  limite = 100,
}: {
  inquilinoId?: string;
  limite?: number;
}) {
  const registos = await listarAuditoria(await criarClienteServidor(), { inquilinoId, limite });
  return (
    <TabelaCartoes<RegistoAuditoria>
      linhas={registos}
      chave={(r) => String(r.id)}
      vazio={t.vazio}
      testId="auditoria"
      colunas={[
        { id: "quando", rotulo: t.quando, valor: (r) => dataHora(r.criado_em) },
        { id: "acao", rotulo: t.acao, valor: (r) => r.accao },
        {
          id: "detalhe",
          rotulo: t.detalhe,
          valor: (r) => (
            <code className="text-xs break-all">
              {r.detalhes ? JSON.stringify(r.detalhes).slice(0, 160) : textos.comum.vazio}
            </code>
          ),
        },
      ]}
    />
  );
}
