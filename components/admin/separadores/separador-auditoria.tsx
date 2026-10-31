import { resumoAuditoria, rotuloAcao } from "@/lib/admin/resumo-auditoria";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataHora } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarAuditoria, type RegistoAuditoria } from "@/lib/repositorios/admin/auditoria";
import { listarFuncionalidades } from "@/lib/repositorios/funcionalidades";
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
  const bd = await criarClienteServidor();
  const [registos, catalogo] = await Promise.all([
    listarAuditoria(bd, { inquilinoId, limite }),
    listarFuncionalidades(bd),
  ]);
  const legenda = {
    sim: textos.comum.sim.toLowerCase(),
    nao: textos.comum.nao.toLowerCase(),
    campos: t.campos,
    chaves: Object.fromEntries(catalogo.map((f) => [f.chave, f.nome])),
  };
  return (
    <TabelaCartoes<RegistoAuditoria>
      linhas={registos}
      chave={(r) => String(r.id)}
      vazio={t.vazio}
      testId="auditoria"
      colunas={[
        { id: "acao", rotulo: t.acao, valor: (r) => rotuloAcao(r.accao, t.acoes) },
        { id: "quando", rotulo: t.quando, valor: (r) => dataHora(r.criado_em) },
        {
          id: "detalhe",
          rotulo: t.detalhe,
          valor: (r) => (
            <span className="text-xs break-words text-muted-foreground">
              {resumoAuditoria(r.detalhes, textos.comum.vazio, legenda)}
            </span>
          ),
        },
      ]}
    />
  );
}
