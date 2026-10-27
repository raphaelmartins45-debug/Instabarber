import { textos } from "@/lib/i18n/pt-PT";
import type { NotaTecnica } from "@/lib/repositorios/painel/historico-cortes";
import { EntradaHistorico } from "./entrada-historico";
import { FormularioNotaTecnica, type ServicoParaLigar } from "./formulario-nota-tecnica";

const t = textos.clientes.tecnica;

/**
 * Histórico de cortes (F.4.14, D-179): uma entrada por serviço, com notas e até duas fotografias,
 * que a equipa pode mostrar ao cliente. Nunca dados de saúde.
 */
export function FichaTecnica({
  clienteId,
  notas,
  eGestor,
  userId,
  consentimento,
  servicos,
}: {
  clienteId: string;
  notas: NotaTecnica[];
  /** O gestor apaga todas as entradas; o barbeiro, as que escreveu (RLS fichas_apagar). */
  eGestor: boolean;
  userId: string;
  consentimento: boolean;
  servicos: ServicoParaLigar[];
}) {
  return (
    <div className="grid gap-3">
      <FormularioNotaTecnica
        clienteId={clienteId}
        consentimento={consentimento}
        servicos={servicos}
      />
      {notas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.vazio}</p>
      ) : (
        <ul className="grid gap-2">
          {notas.map((n) => (
            <EntradaHistorico key={n.id} n={n} podeApagar={eGestor || n.criadoPor === userId} />
          ))}
        </ul>
      )}
    </div>
  );
}
